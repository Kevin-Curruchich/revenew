import { revenewApi } from "@/api/revenewApi";
import type { AgentThread, ThreadState } from "../domain/agent";

const BASE = "/agent/threads";

export const getThreads = async (): Promise<AgentThread[]> => {
  const response = await revenewApi.get<AgentThread[]>(BASE);
  return response.data;
};

/** Without a title the server uses "Conversación nueva" and renames the
 * thread after its first message. */
export const createThread = async (title?: string): Promise<AgentThread> => {
  const response = await revenewApi.post<AgentThread>(
    BASE,
    title ? { title } : {},
  );
  return response.data;
};

export const getThread = async (threadId: string): Promise<AgentThread> => {
  const response = await revenewApi.get<AgentThread>(`${BASE}/${threadId}`);
  return response.data;
};

export const renameThread = async (
  threadId: string,
  title: string,
): Promise<AgentThread> => {
  const response = await revenewApi.patch<AgentThread>(`${BASE}/${threadId}`, {
    title,
  });
  return response.data;
};

export const deleteThread = async (threadId: string): Promise<void> => {
  await revenewApi.delete(`${BASE}/${threadId}`);
};

/**
 * Saved conversation + open confirmations. The only source of a huella once
 * the live stream is gone (refresh, lost connection), so it is loaded when a
 * thread is opened and after any stream that ended abnormally.
 */
export const getThreadState = async (
  threadId: string,
): Promise<ThreadState> => {
  const response = await revenewApi.get<ThreadState>(
    `${BASE}/${threadId}/state`,
  );
  return response.data;
};
