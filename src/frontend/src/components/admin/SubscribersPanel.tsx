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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Mail, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteSubscription,
  useGetAllSubscriptions,
} from "../../hooks/useAdmin";

export default function SubscribersPanel() {
  const { data: subscriptions, isLoading } = useGetAllSubscriptions();
  const deleteMutation = useDeleteSubscription();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success("Subscriber removed");
      setDeletingId(null);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to remove subscriber";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        data-ocid="subscribers.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-chart-2/10 border border-chart-2/20">
            <Users className="h-4 w-4 text-chart-2" />
          </div>
          <h2 className="text-2xl font-semibold">Subscribers</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 border border-border/60 px-3 py-1 rounded-full">
          <Mail className="h-3.5 w-3.5" />
          {subscriptions?.length ?? 0} total
        </span>
      </div>

      {!subscriptions || subscriptions.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground gap-3"
          data-ocid="subscribers.empty_state"
        >
          <Mail className="h-10 w-10 opacity-30" />
          <p className="font-medium">No subscribers yet</p>
          <p className="text-sm">
            Subscribers will appear here once people sign up.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl border border-border overflow-hidden"
          data-ocid="subscribers.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Email</TableHead>
                <TableHead>Subscribed At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub, index) => (
                <TableRow
                  key={sub.id}
                  className="hover:bg-muted/30 transition-colors"
                  data-ocid={`subscribers.item.${index + 1}`}
                >
                  <TableCell className="font-medium">{sub.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(sub.subscribedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingId(sub.id)}
                      className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      data-ocid={`subscribers.delete_button.${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent data-ocid="subscribers.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this subscriber?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this subscriber? They will no longer receive updates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="subscribers.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
              data-ocid="subscribers.delete.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove Subscriber
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
