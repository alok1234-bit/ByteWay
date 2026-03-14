import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Search, VideoOff, X } from "lucide-react";
import { motion } from "motion/react";
import SEO from "../components/SEO";
import { useSearch } from "../context/SearchContext";
import { useGetAllVideos } from "../hooks/useVideos";
import type { VideoPost } from "../types/video";

function formatDate(timestamp: bigint) {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function VideoCard({ video, index }: { video: VideoPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
      data-ocid={`videos.item.${index + 1}`}
    >
      {/* Video Player */}
      <div className="relative bg-black aspect-video overflow-hidden">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : null}
        {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded content without guaranteed captions */}
        <video
          src={video.videoUrl}
          controls
          preload="metadata"
          poster={video.thumbnailUrl}
          className={`w-full h-full object-contain absolute inset-0 ${
            video.thumbnailUrl ? "opacity-0 hover:opacity-100" : ""
          } transition-opacity duration-300`}
          data-ocid={`videos.canvas_target.${index + 1}`}
        />
        {!video.thumbnailUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 pointer-events-none">
            <Play className="h-14 w-14 text-primary/50" />
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-5 space-y-3">
        <h2 className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h2>
        {video.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {video.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {formatDate(video.uploadedAt)}
          </Badge>
        </div>
      </div>
    </motion.article>
  );
}

export default function VideosPage() {
  const { data: videos, isLoading } = useGetAllVideos();
  const { searchQuery, setSearchQuery } = useSearch();

  const q = searchQuery.toLowerCase();
  const filteredVideos =
    searchQuery.length >= 1
      ? (videos ?? []).filter(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            (v.description ?? "").toLowerCase().includes(q),
        )
      : (videos ?? []);

  return (
    <>
      <SEO title="Videos" description="Watch our video collection on ByteWay" />

      <div className="container py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-2">
              <Play className="h-4 w-4" />
              Video Gallery
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Our Videos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch our video collection — tutorials, stories, and more.
            </p>
          </motion.div>

          {/* Active search badge */}
          {searchQuery && (
            <div className="flex items-center gap-2 mb-6 animate-in fade-in duration-300">
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-500/10 text-indigo-400 border border-indigo-400/30"
              >
                <Search className="h-3.5 w-3.5" />
                Searching for: <span className="font-bold">{searchQuery}</span>
              </Badge>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              data-ocid="videos.loading_state"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border overflow-hidden"
                >
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State - No videos at all */}
          {!isLoading && (!videos || videos.length === 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border text-muted-foreground gap-4"
              data-ocid="videos.empty_state"
            >
              <div className="p-6 rounded-full bg-muted/50">
                <VideoOff className="h-12 w-12 opacity-40" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-semibold text-foreground">
                  No videos yet
                </h2>
                <p className="text-sm">
                  Check back soon — videos will appear here once uploaded.
                </p>
              </div>
            </motion.div>
          )}

          {/* Empty State - No search results */}
          {!isLoading &&
            videos &&
            videos.length > 0 &&
            filteredVideos.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border text-muted-foreground gap-4"
                data-ocid="videos.empty_state"
              >
                <div className="p-6 rounded-full bg-muted/50">
                  <Search className="h-12 w-12 opacity-40" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    No videos match your search
                  </h2>
                  <p className="text-sm">
                    No videos found for &quot;{searchQuery}&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors mt-2"
                  >
                    Clear search
                  </button>
                </div>
              </motion.div>
            )}

          {/* Videos Grid */}
          {!isLoading && filteredVideos.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVideos.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
