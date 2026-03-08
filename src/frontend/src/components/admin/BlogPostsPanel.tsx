import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { BlogPost } from "../../backend";
import {
  useApproveBlogPost,
  useCreateBlogPost,
  useGetAllBlogPostsAdmin,
  useRejectBlogPost,
} from "../../hooks/useAdmin";

export default function BlogPostsPanel() {
  const { data: posts, isLoading } = useGetAllBlogPostsAdmin();
  const approveMutation = useApproveBlogPost();
  const rejectMutation = useRejectBlogPost();
  const createMutation = useCreateBlogPost();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    author: "",
    tags: "",
    coverImageId: "",
  });

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Blog post approved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve post");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync(id);
      toast.success("Blog post rejected");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject post");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPost.title || !newPost.content || !newPost.author) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: newPost.title,
        content: newPost.content,
        author: newPost.author,
        tags: newPost.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        coverImageId: newPost.coverImageId || undefined,
      });
      toast.success("Blog post created successfully");
      setIsCreateDialogOpen(false);
      setNewPost({
        title: "",
        content: "",
        author: "",
        tags: "",
        coverImageId: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    }
  };

  const getStatusBadge = (status: BlogPost["status"]) => {
    const variants = {
      pending: "default",
      approved: "default",
      rejected: "destructive",
    } as const;

    const colors = {
      pending:
        "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      approved:
        "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      rejected: "",
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Blog Posts</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  placeholder="Enter post title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={newPost.author}
                  onChange={(e) =>
                    setNewPost({ ...newPost, author: e.target.value })
                  }
                  placeholder="Enter author name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  placeholder="Write your post content..."
                  rows={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newPost.tags}
                  onChange={(e) =>
                    setNewPost({ ...newPost, tags: e.target.value })
                  }
                  placeholder="technology, lifestyle, tips"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  value={newPost.coverImageId}
                  onChange={(e) =>
                    setNewPost({ ...newPost, coverImageId: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Post"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No blog posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>{formatDate(post.publishedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {post.status !== "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(post.id)}
                          disabled={approveMutation.isPending}
                          className="hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/20"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {post.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(post.id)}
                          disabled={rejectMutation.isPending}
                          className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
