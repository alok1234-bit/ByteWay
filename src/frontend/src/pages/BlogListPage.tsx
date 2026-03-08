import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Calendar, User } from "lucide-react";
import SEO from "../components/SEO";
import { useGetAllBlogPostMetadata } from "../hooks/useBlog";

export default function BlogListPage() {
  const { data: posts, isLoading } = useGetAllBlogPostMetadata();
  const navigate = useNavigate();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <SEO title="Blog" description="Read our latest articles and stories" />

      <div className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-top duration-700">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-chart-1 to-chart-2 bg-clip-text text-transparent">
              Our Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of articles, stories, and insights.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border border-border bg-card animate-pulse"
                >
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!posts || posts.length === 0) && (
            <div className="text-center py-16 animate-in fade-in zoom-in duration-700">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-semibold mb-2">No posts yet</h2>
              <p className="text-muted-foreground">
                Check back soon for new articles and stories.
              </p>
            </div>
          )}

          {/* Blog Posts */}
          {!isLoading && posts && posts.length > 0 && (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  className="group p-6 rounded-xl border border-border bg-card hover:border-chart-1/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationDuration: "500ms",
                  }}
                >
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold group-hover:text-chart-1 transition-colors">
                      {post.title}
                    </h2>
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
                    <Button
                      variant="ghost"
                      onClick={() =>
                        navigate({ to: "/blog/$id", params: { id: post.id } })
                      }
                      className="group/btn p-0 h-auto hover:bg-transparent"
                    >
                      <span className="flex items-center gap-2 text-chart-1 font-medium">
                        Read More
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
