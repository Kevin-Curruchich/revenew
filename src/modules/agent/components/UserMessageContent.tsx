import { Link } from "react-router";

import { commandLabels } from "../domain/labels";
import {
  splitMentions,
  type Comando,
  type Mencion,
  type MentionTipo,
} from "../domain/mentions";

const mentionHref: Record<MentionTipo, (id: string) => string> = {
  cliente: (id) => `/customers/${id}`,
  producto: (id) => `/products/${id}`,
  venta: (id) => `/sales/${id}`,
};

interface UserMessageContentProps {
  text: string;
  comando?: Comando;
  menciones?: Mencion[];
}

/** What the person typed, verbatim, with mentions as links. */
export const UserMessageContent = ({
  text,
  comando,
  menciones,
}: UserMessageContentProps) => {
  const segments = splitMentions(text, menciones);
  if (!comando && segments.length === 1 && segments[0].kind === "text") {
    return text;
  }
  return (
    <>
      {comando ? (
        <span className="mb-1 block text-xs font-semibold tracking-wide uppercase opacity-80">
          {commandLabels[comando].label}
        </span>
      ) : null}
      {segments.map((segment, index) =>
        segment.kind === "text" ? (
          segment.text
        ) : (
          <Link
            key={index}
            to={mentionHref[segment.mencion.tipo](segment.mencion.id)}
            className="rounded bg-primary-foreground/20 px-1 font-medium underline-offset-2 hover:underline"
          >
            {segment.text}
          </Link>
        ),
      )}
    </>
  );
};
