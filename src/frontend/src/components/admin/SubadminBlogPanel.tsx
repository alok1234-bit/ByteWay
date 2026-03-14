import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  ImageIcon,
  Loader2,
  Rocket,
  Tag,
  User,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { BlogPost } from "../../backend";
import {
  useCreateAndPublishBlogPost,
  useCreateBlogPost,
  useGetAllBlogPostsAdmin,
} from "../../hooks/useAdmin";
import { useAdminAuth } from "../../hooks/useAdminAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  author: string;
  content: string;
  tags: string;
  coverImageId: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: BlogPost["status"] }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
        <CheckCircle2 className="h-3 w-3" />
        Published
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20">
        <XCircle className="h-3 w-3" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubadminBlogPanel() {
  const { currentUsername } = useAdminAuth();

  // Hooks
  const { data: allPosts, isLoading: postsLoading } = useGetAllBlogPostsAdmin();
  const createAndPublishMutation = useCreateAndPublishBlogPost();
  const createDraftMutation = useCreateBlogPost();

  // Form state
  const [form, setForm] = useState<FormState>({
    title: "",
    author: currentUsername,
    content: "",
    tags: "",
    coverImageId: "",
  });
  const [publishImmediately, setPublishImmediately] = useState(true);

  const isSubmitting =
    createAndPublishMutation.isPending || createDraftMutation.isPending;

  // Filter posts to only this subadmin's posts
  const myPosts = (allPosts ?? []).filter((p) => p.author === currentUsername);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const patch = (update: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...update }));

  const resetForm = () => {
    setForm({
      title: "",
      author: currentUsername,
      content: "",
      tags: "",
      coverImageId: "",
    });
    setPublishImmediately(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (!form.author.trim()) {
      toast.error("Author is required");
      return;
    }

    const input = {
      title: form.title.trim(),
      content: form.content.trim(),
      author: form.author.trim(),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverImageId: form.coverImageId.trim() || undefined,
    };

    try {
      if (publishImmediately) {
        await createAndPublishMutation.mutateAsync(input);
        toast.success("Article published successfully! It's now live.");
      } else {
        await createDraftMutation.mutateAsync(input);
        toast.success("Article saved as draft. Admin can publish it.");
      }
      resetForm();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to submit article";
      toast.error(msg);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ── Write a New Post Card ── */}
      <Card className="border-border shadow-sm overflow-hidden">
        {/* Accent strip at the top */}
        <div className="h-1 w-full bg-gradient-to-r from-chart-2 via-chart-1 to-chart-4" />

        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-chart-2/10 text-chart-2">
              <FileText className="h-5 w-5" />
            </div>
            Write a New Article
          </CardTitle>
          <CardDescription>
            Fill in the details below and hit "Publish Now" to post your article
            immediately, or save it as a draft for later.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Publish immediately toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Zap
                    className={`h-4 w-4 transition-colors ${
                      publishImmediately
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }`}
                  />
                  <Label
                    htmlFor="subadmin-publish-toggle"
                    className="text-sm font-semibold cursor-pointer"
                  >
                    Publish immediately
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {publishImmediately
                    ? "Article goes live right away — visible to all readers"
                    : "Article will be saved as a draft — admin can publish later"}
                </p>
              </div>
              <Switch
                id="subadmin-publish-toggle"
                checked={publishImmediately}
                onCheckedChange={setPublishImmediately}
                data-ocid="subadmin.blog.publish.switch"
                className="data-[state=checked]:bg-green-500"
              />
            </div>

            {/* Two-column: Title + Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sa-title" className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sa-title"
                  value={form.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="Enter a compelling article title"
                  required
                  data-ocid="subadmin.blog.title.input"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="sa-author"
                  className="flex items-center gap-1.5"
                >
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Author <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sa-author"
                  value={form.author}
                  onChange={(e) => patch({ author: e.target.value })}
                  placeholder="Your name"
                  required
                  data-ocid="subadmin.blog.author.input"
                />
              </div>
            </div>

            {/* Content textarea */}
            <div className="space-y-2">
              <Label htmlFor="sa-content" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Content <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="sa-content"
                value={form.content}
                onChange={(e) => patch({ content: e.target.value })}
                placeholder="Write your article here... Share your thoughts, insights, and ideas."
                rows={14}
                className="resize-y min-h-[200px] leading-relaxed"
                required
                data-ocid="subadmin.blog.content.textarea"
              />
            </div>

            {/* Two-column: Tags + Cover Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sa-tags" className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Tags{" "}
                  <span className="text-xs text-muted-foreground ml-1">
                    (comma-separated)
                  </span>
                </Label>
                <Input
                  id="sa-tags"
                  value={form.tags}
                  onChange={(e) => patch({ tags: e.target.value })}
                  placeholder="technology, tips, tutorial"
                  data-ocid="subadmin.blog.tags.input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sa-cover" className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Cover Image URL{" "}
                  <span className="text-xs text-muted-foreground ml-1">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="sa-cover"
                  value={form.coverImageId}
                  onChange={(e) => patch({ coverImageId: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  data-ocid="subadmin.blog.cover.input"
                />
              </div>
            </div>

            {/* Submit button — full width, prominent */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-12 text-base font-semibold gap-2 transition-all ${
                publishImmediately
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
              data-ocid="subadmin.blog.submit_button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {publishImmediately ? "Publishing..." : "Saving draft..."}
                </>
              ) : publishImmediately ? (
                <>
                  <Rocket className="h-5 w-5" />
                  Publish Now
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Save as Draft
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── My Posts Card ── */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-chart-1/10 text-chart-1">
              <BookOpen className="h-5 w-5" />
            </div>
            My Articles
            {myPosts.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {myPosts.length} {myPosts.length === 1 ? "article" : "articles"}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Articles you have written. Status updates as the admin reviews them.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Loading state */}
          {postsLoading ? (
            <div
              className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground"
              data-ocid="subadmin.blog.posts.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-chart-2" />
              <p className="text-sm">Loading your articles...</p>
            </div>
          ) : myPosts.length === 0 ? (
            /* Empty state */
            <div
              className="flex flex-col items-center justify-center py-16 gap-4 rounded-xl border border-dashed border-border text-center"
              data-ocid="subadmin.blog.posts.empty_state"
            >
              <div className="p-4 rounded-full bg-muted/60">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-medium text-foreground">No articles yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Write your first article using the form above!
                </p>
              </div>
            </div>
          ) : (
            /* Posts list */
            <div className="space-y-3" data-ocid="subadmin.blog.posts.table">
              {myPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                  data-ocid={`subadmin.blog.posts.item.${index + 1}`}
                >
                  {/* Post info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {post.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.publishedAt)}
                      </span>
                      {post.tags.length > 0 && (
                        <>
                          <span className="text-muted-foreground/40 text-xs">
                            •
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{post.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="shrink-0">
                    <StatusBadge status={post.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
