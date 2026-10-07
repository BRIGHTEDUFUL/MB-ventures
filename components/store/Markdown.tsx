import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { FOCUS_RING } from "@/lib/focus";

const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

/**
 * Only http/https/mailto/tel URLs and relative paths are allowed. Browsers drop
 * whitespace and control characters before parsing a URL, so they are removed
 * first; otherwise " javascript:alert(1)" would look like a relative link.
 */
function isSafeUrl(url: string): boolean {
  const cleaned = url.replace(/[\u0000-\u0020]/g, "");
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(cleaned);
  if (scheme === null) return cleaned.length > 0;
  return SAFE_SCHEMES.has(scheme[1].toLowerCase());
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-heading font-bold text-xl sm:text-2xl text-ink tracking-tight leading-tight mt-6 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading font-bold text-lg sm:text-xl text-ink tracking-tight leading-tight mt-6 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading font-semibold text-base sm:text-lg text-ink tracking-tight leading-tight mt-4 first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-heading font-semibold text-sm sm:text-base text-ink mt-4 first:mt-0">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="font-heading font-semibold text-sm text-ink mt-4 first:mt-0">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="font-heading font-semibold text-sm text-ink mt-4 first:mt-0">{children}</h6>
  ),
  p: ({ children }) => (
    <p className="text-sm sm:text-base text-ink-muted leading-relaxed mt-2 first:mt-0">
      {children}
    </p>
  ),
  a: ({ href, children }) =>
    href ? (
      <a
        href={href}
        className={`text-link underline underline-offset-2 hover:text-brand-hover transition-colors duration-120 rounded ${FOCUS_RING}`}
      >
        {children}
      </a>
    ) : (
      // Unsafe URL (e.g. javascript:): keep the text, drop the link.
      <span>{children}</span>
    ),
  ul: ({ children }) => (
    <ul className="list-disc pl-3 space-y-1.5 mt-2 first:mt-0 text-sm sm:text-base text-ink-muted leading-relaxed marker:text-ink-subtle">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-3 space-y-1.5 mt-2 first:mt-0 text-sm sm:text-base text-ink-muted leading-relaxed marker:text-ink-subtle">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l border-line pl-3 mt-2 first:mt-0">{children}</blockquote>
  ),
  code: ({ children }) => (
    <code className="font-mono text-xs bg-canvas rounded-sm px-1 py-0.5 text-ink">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-canvas border border-line rounded-lg p-3 overflow-x-auto mt-4 first:mt-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-xs">
      {children}
    </pre>
  ),
  hr: () => <hr className="border-t border-line my-6" />,
  img: ({ src, alt }) =>
    src ? (
      // Markdown images have no known intrinsic size, so next/image cannot be used here.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className="rounded-sm max-w-full h-auto my-4" loading="lazy" />
    ) : null,
};

interface MarkdownProps {
  children: string;
}

/**
 * Renders content-page markdown with storefront typography (docs/DESIGN.md).
 * No raw-HTML plugin: raw HTML in the source is skipped, and urlTransform keeps
 * only http/https/mailto/tel and relative URLs on links and images.
 */
export function Markdown({ children }: MarkdownProps) {
  return (
    <ReactMarkdown
      skipHtml
      urlTransform={(url) => (isSafeUrl(url) ? url : "")}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}
