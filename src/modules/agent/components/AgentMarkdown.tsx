import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Element styles for the agent's answers. The model (Claude) writes GitHub
 * flavored markdown — bold, lists, inline code and tables — without being
 * asked to, so it is rendered instead of shown raw.
 */
const components: Components = {
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5">{children}</ol>
  ),
  h1: ({ children }) => <p className="font-semibold">{children}</p>,
  h2: ({ children }) => <p className="font-semibold">{children}</p>,
  h3: ({ children }) => <p className="font-semibold">{children}</p>,
  h4: ({ children }) => <p className="font-semibold">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-2"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-background/70 px-1 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-md bg-background/70 p-2 [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border" />,
  // Wide tables scroll horizontally inside the bubble instead of breaking
  // the layout on mobile.
  table: ({ children }) => (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs sm:text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border">{children}</thead>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-border/60 last:border-0">{children}</tr>
  ),
  th: ({ children, style }) => (
    <th style={style} className="px-2 py-1.5 font-semibold whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="px-2 py-1.5 align-top">
      {children}
    </td>
  ),
};

const remarkPlugins = [remarkGfm];

/**
 * Raw HTML in the text is NOT rendered (react-markdown's default), so the
 * model's output can't inject markup into the page.
 */
export const AgentMarkdown = ({ text }: { text: string }) => (
  <div className="space-y-3 break-words">
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {text}
    </ReactMarkdown>
  </div>
);
