import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createThread,
  deleteThread,
  getThreads,
  getThreadState,
  renameThread,
} from "../actions/threads";

export const agentKeys = {
  all: ["agent"] as const,
  threads: () => [...agentKeys.all, "threads"] as const,
  state: (threadId: string) =>
    [...agentKeys.all, "threads", threadId, "state"] as const,
};

export const useAgentThreads = () =>
  useQuery({
    queryKey: agentKeys.threads(),
    queryFn: getThreads,
  });

/**
 * Always fetched fresh when a thread is opened: it is the only source of the
 * open confirmations (and their huella) after a refresh.
 */
export const useThreadState = (threadId: string) =>
  useQuery({
    queryKey: agentKeys.state(threadId),
    queryFn: () => getThreadState(threadId),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

export const useCreateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createThread(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: agentKeys.threads() }),
  });
};

export const useRenameThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      renameThread(id, title),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: agentKeys.threads() }),
  });
};

export const useDeleteThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteThread,
    onSuccess: (_, threadId) => {
      queryClient.removeQueries({ queryKey: agentKeys.state(threadId) });
      return queryClient.invalidateQueries({ queryKey: agentKeys.threads() });
    },
  });
};
