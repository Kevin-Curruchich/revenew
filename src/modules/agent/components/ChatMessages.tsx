import { Bot, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatItem } from "../domain/conversation";
import { getToolLabel } from "../domain/labels";
import { AgentMarkdown } from "./AgentMarkdown";

const ToolChip = ({ name }: { name: string }) => (
  <div className="flex justify-start">
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
      <Wrench className="size-3" />
      {getToolLabel(name, "done")}
    </span>
  </div>
);

const Bubble = ({ item }: { item: Extract<ChatItem, { text: string }> }) => {
  const isUser = item.kind === "user";
  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <span
          aria-hidden="true"
          className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <Bot className="size-4" />
        </span>
      ) : null}
      <div
        className={cn(
          "rounded-2xl px-4 py-2 text-sm",
          isUser
            ? "max-w-[85%] rounded-br-sm bg-primary text-primary-foreground whitespace-pre-wrap break-words"
            : "max-w-[92%] min-w-0 rounded-bl-sm bg-muted",
        )}
      >
        {/* What the person typed is shown verbatim; the agent's answers
            are markdown. */}
        {isUser ? item.text : <AgentMarkdown text={item.text} />}
        {item.kind === "assistant" && item.streaming ? (
          <span
            aria-hidden="true"
            className="mt-1 block h-4 w-1.5 animate-pulse bg-current"
          />
        ) : null}
      </div>
    </div>
  );
};

export const ChatMessages = ({ items }: { items: ChatItem[] }) => (
  <>
    {items.map((item) =>
      item.kind === "tool" ? (
        <ToolChip key={item.id} name={item.name} />
      ) : (
        <Bubble key={item.id} item={item} />
      ),
    )}
  </>
);

/** Shown while a turn runs, so a slow tool (FIFO lookups) isn't silence. */
export const AgentActivity = ({
  activeTool,
}: {
  activeTool: string | null;
}) => (
  <div
    role="status"
    className="flex items-center gap-2 text-sm text-muted-foreground"
  >
    <span className="flex gap-1" aria-hidden="true">
      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="size-1.5 animate-bounce rounded-full bg-current" />
    </span>
    {activeTool ? getToolLabel(activeTool, "running") : "Pensando…"}
  </div>
);
