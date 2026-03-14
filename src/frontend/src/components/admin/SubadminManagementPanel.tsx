import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Shield,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SubadminAccount } from "../../hooks/useAdminAuth";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function SubadminManagementPanel() {
  const { subadmins, addSubadmin, updateSubadmin, deleteSubadmin } =
    useAdminAuth();

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<SubadminAccount | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<SubadminAccount | null>(
    null,
  );

  /* ─── Create ─── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error("Username and password are required");
      return;
    }
    setIsCreating(true);
    await new Promise((r) => setTimeout(r, 300));
    const ok = addSubadmin(newUsername.trim(), newPassword.trim());
    setIsCreating(false);
    if (!ok) {
      toast.error("A sub-admin with that username already exists");
      return;
    }
    toast.success(`Sub-admin "${newUsername.trim()}" created`);
    setNewUsername("");
    setNewPassword("");
    setIsCreateOpen(false);
  };

  /* ─── Edit ─── */
  const openEdit = (account: SubadminAccount) => {
    setEditTarget(account);
    setEditUsername(account.username);
    setEditPassword(account.password);
    setShowEditPassword(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!editUsername.trim() || !editPassword.trim()) {
      toast.error("Username and password are required");
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    const ok = updateSubadmin(
      editTarget.id,
      editUsername.trim(),
      editPassword.trim(),
    );
    setIsSaving(false);
    if (!ok) {
      toast.error("That username is already taken by another sub-admin");
      return;
    }
    toast.success("Sub-admin updated");
    setEditTarget(null);
  };

  /* ─── Delete ─── */
  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSubadmin(deleteTarget.id);
    toast.success(`Sub-admin "${deleteTarget.username}" removed`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <UserCheck className="h-6 w-6 text-chart-2" />
          <div>
            <h2 className="text-2xl font-semibold">Sub-Admin Accounts</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sub-admins can only post blog articles — no other permissions.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-chart-2 to-chart-1 hover:opacity-90 gap-2"
          data-ocid="subadmin.open_modal_button"
        >
          <Plus className="h-4 w-4" />
          Add Sub-Admin
        </Button>
      </div>

      {/* Table / Empty state */}
      {subadmins.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground gap-3"
          data-ocid="subadmin.empty_state"
        >
          <Shield className="h-10 w-10 opacity-30" />
          <p className="font-medium">No sub-admins yet</p>
          <p className="text-sm">
            Create a sub-admin account using the button above.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl border border-border overflow-hidden"
          data-ocid="subadmin.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Password</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subadmins.map((account, index) => (
                <TableRow
                  key={account.id}
                  className="hover:bg-muted/30 transition-colors"
                  data-ocid={`subadmin.item.${index + 1}`}
                >
                  <TableCell className="font-medium">
                    {account.username}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-chart-2/10 text-chart-2 border-chart-2/20"
                    >
                      Sub-Admin
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {"•".repeat(Math.min(account.password.length, 8))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(account)}
                        className="hover:bg-chart-1/10 hover:text-chart-1 hover:border-chart-1/30"
                        data-ocid={`subadmin.edit_button.${index + 1}`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteTarget(account)}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        data-ocid={`subadmin.delete_button.${index + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Create Dialog ── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent data-ocid="subadmin.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Create Sub-Admin
            </DialogTitle>
            <DialogDescription>
              Set a username and password. The sub-admin can only post blog
              articles.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="new-sa-username">Username</Label>
              <Input
                id="new-sa-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="e.g. editor1"
                autoComplete="off"
                data-ocid="subadmin.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-sa-password">Password</Label>
              <div className="relative">
                <Input
                  id="new-sa-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set a secure password"
                  autoComplete="new-password"
                  className="pr-10"
                  data-ocid="subadmin.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                data-ocid="subadmin.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-gradient-to-r from-chart-2 to-chart-1 hover:opacity-90 gap-2"
                data-ocid="subadmin.submit_button"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                Create Sub-Admin
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent data-ocid="subadmin.edit.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Edit Sub-Admin
            </DialogTitle>
            <DialogDescription>
              Update the username or password for this sub-admin account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-sa-username">Username</Label>
              <Input
                id="edit-sa-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                autoComplete="off"
                data-ocid="subadmin.edit.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sa-password">Password</Label>
              <div className="relative">
                <Input
                  id="edit-sa-password"
                  type={showEditPassword ? "text" : "password"}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                  data-ocid="subadmin.edit.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showEditPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                data-ocid="subadmin.edit.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2"
                data-ocid="subadmin.edit.save_button"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="subadmin.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove sub-admin?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{deleteTarget?.username}</strong>? They will no longer be
              able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="subadmin.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
              data-ocid="subadmin.delete.confirm_button"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
