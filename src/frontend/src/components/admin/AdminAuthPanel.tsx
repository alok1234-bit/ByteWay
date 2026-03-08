import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Principal } from "@dfinity/principal";
import { Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../../backend";
import { useAssignCallerUserRole } from "../../hooks/useAdmin";

export default function AdminAuthPanel() {
  const [principalText, setPrincipalText] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.user);
  const assignRoleMutation = useAssignCallerUserRole();

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!principalText.trim()) {
      toast.error("Please enter a principal ID");
      return;
    }

    try {
      const principal = Principal.fromText(principalText.trim());
      await assignRoleMutation.mutateAsync({ user: principal, role });
      toast.success(`Role ${role} assigned successfully`);
      setPrincipalText("");
    } catch (error: any) {
      if (error.message?.includes("Invalid principal")) {
        toast.error("Invalid principal ID format");
      } else {
        toast.error(error.message || "Failed to assign role");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-chart-1" />
        <h2 className="text-2xl font-semibold">User Role Management</h2>
      </div>

      <div className="p-6 rounded-lg border border-border bg-card space-y-4">
        <p className="text-sm text-muted-foreground">
          Assign roles to users by their principal ID. This is a development
          tool for setting up admin access.
        </p>

        <form onSubmit={handleAssignRole} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Principal ID</Label>
            <Input
              id="principal"
              value={principalText}
              onChange={(e) => setPrincipalText(e.target.value)}
              placeholder="Enter principal ID"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.admin}>Admin</SelectItem>
                <SelectItem value={UserRole.user}>User</SelectItem>
                <SelectItem value={UserRole.guest}>Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={assignRoleMutation.isPending}
            className="w-full bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90"
          >
            {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
          </Button>
        </form>
      </div>
    </div>
  );
}
