import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { VideoInput, VideoPost } from "../types/video";

export type { VideoPost, VideoInput };

const STORAGE_KEY = "byteway_videos";

function loadVideos(): VideoPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw, (key, value) => {
      if (key === "uploadedAt" && typeof value === "string") {
        return BigInt(value);
      }
      return value;
    }) as VideoPost[];
  } catch {
    return [];
  }
}

function saveVideos(videos: VideoPost[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(videos, (_key, value) => {
      if (typeof value === "bigint") return value.toString();
      return value;
    }),
  );
}

function generateId(): string {
  return `vid_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useGetAllVideos() {
  return useQuery<VideoPost[]>({
    queryKey: ["videos"],
    queryFn: () => loadVideos(),
    staleTime: 0,
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: VideoInput): Promise<string> => {
      const videos = loadVideos();
      const id = generateId();
      const newVideo: VideoPost = {
        id,
        title: input.title,
        description: input.description,
        videoUrl: input.videoUrl,
        thumbnailUrl: input.thumbnailUrl,
        uploadedAt: BigInt(Date.now()) * BigInt(1_000_000),
      };
      saveVideos([newVideo, ...videos]);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: VideoInput;
    }): Promise<void> => {
      const videos = loadVideos();
      const updated = videos.map((v) => (v.id === id ? { ...v, ...input } : v));
      saveVideos(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const videos = loadVideos();
      saveVideos(videos.filter((v) => v.id !== id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}
