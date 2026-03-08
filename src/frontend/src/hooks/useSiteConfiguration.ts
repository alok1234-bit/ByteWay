import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SiteConfiguration } from "../backend";
import { useActor } from "./useActor";

export function useGetSiteConfiguration() {
  const { actor, isFetching } = useActor();

  return useQuery<SiteConfiguration>({
    queryKey: ["siteConfiguration"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getSiteConfiguration();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSiteConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: SiteConfiguration) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateSiteConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteConfiguration"] });
    },
  });
}
