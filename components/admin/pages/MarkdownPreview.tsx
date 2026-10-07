"use client";

import ReactMarkdown, { type Components } from "react-markdown";

/**
 * Preview styling for the editor. react-markdown escapes raw HTML (no rehype-raw
 * plugin), so pasted markup shows as text instead of rendering.
 */
const previewComponents: Components = {
  h1: ({ children }) => (
    <h2 className="font-heading font-bold text-xl text-ink mt-5 first:mt-0">{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 className="font-heading font-bold text-base text-ink mt-4 first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="font-heading font-semibold text-sm text-ink mt-3 first:mt-0">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-xs leading-relaxed text-ink my-2 first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 my-2 space-y-1 text-xs text-ink">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 my-2 space-y-1 text-xs text-ink">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a href={href} className="text-link underline underline-offset-2 hover:text-brand-hover">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  code: ({ children }) => (
    <code className="font-mono text-[11px] bg-canvas rounded px-1 py-0.5">{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-line pl-3 my-2 text-ink-muted">{children}</blockquote>
  ),
  hr: () => <hr className="border-line my-4" />,
};

interface MarkdownPreviewProps {
  markdown: string;
}

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  if (!markdown.trim()) {
    return <p className="text-xs text-ink-muted">Nothing to preview yet.</p>;
  }

  return <ReactMarkdown components={previewComponents}>{markdown}</ReactMarkdown>;
}
