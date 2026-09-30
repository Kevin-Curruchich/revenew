import { Outlet, useParams } from "react-router";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ThreadList } from "../components/ThreadList";

/**
 * Threads on the left, the open conversation on the right. On mobile only
 * one of the two is visible at a time.
 */
export const AgentPage = () => {
  const { threadId } = useParams();

  return (
    <div className="-m-4 flex h-[calc(100dvh-var(--header-height))] gap-4 p-4 md:-m-8 md:p-8">
      <Card
        className={cn(
          "w-full shrink-0 gap-0 overflow-hidden py-0 md:flex md:w-72",
          threadId && "hidden",
        )}
      >
        <ThreadList activeThreadId={threadId} />
      </Card>
      <Card
        className={cn(
          "min-w-0 flex-1 gap-0 overflow-hidden py-0",
          !threadId && "hidden md:flex",
        )}
      >
        <Outlet />
      </Card>
    </div>
  );
};
