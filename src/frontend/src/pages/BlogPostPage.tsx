import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import BlogPostContent from "../components/Blog/BlogPostContent";
import SEO from "../components/SEO";
import { useGetBlogPostById } from "../hooks/useBlog";

export default function BlogPostPage() {
  const { id } = useParams({ from: "/blog/$id" });
  const navigate = useNavigate();
  const { data: post, isLoading, error } = useGetBlogPostById(id);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-12 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="space-y-3 pt-8">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto text-center space-y-4 animate-in fade-in zoom-in duration-700">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold">Post Not Found</h1>
          <p className="text-muted-foreground">
            The blog post you're looking for doesn't exist or is not available.
          </p>
          <Button onClick={() => navigate({ to: "/blog" })} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={post.title} description={post.content.substring(0, 160)} />

      <article className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/blog" })}
            className="mb-8 -ml-2 animate-in fade-in slide-in-from-left duration-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          {/* Post Header */}
          <header className="space-y-6 mb-8 animate-in fade-in slide-in-from-top duration-700">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="animate-in zoom-in duration-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Cover Image */}
          {post.coverImageId && (
            <div className="mb-8 rounded-xl overflow-hidden border border-border animate-in fade-in zoom-in duration-700">
              <img
                src={post.coverImageId}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            <BlogPostContent content={post.content} />
          </div>
        </div>
      </article>
    </>
  );
}
