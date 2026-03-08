import { useQuery } from "@tanstack/react-query";
import type { BlogPost, BlogPostMetadata } from "../backend";
import { useActor } from "./useActor";

export function useGetAllBlogPostMetadata() {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPostMetadata[]>({
    queryKey: ["blogPostMetadata"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBlogPostMetadata();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBlogPostById(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost>({
    queryKey: ["blogPost", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getBlogPostById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}
