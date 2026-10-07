import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Container } from "@/components/shared/Container";
import { Markdown } from "@/components/store/Markdown";

export const dynamic = "force-dynamic";

/**
 * Inline copy of convex/lib/reservedSlugs.ts: a Next server component cannot
 * import that Convex module, so the list is duplicated here for defense in
 * depth. Keep both copies in sync.
 */
const RESERVED_SLUGS = [
  "cart",
  "checkout",
  "search",
  "category",
  "product",
  "account",
  "admin",
  "track",
  "contact",
  "sign-in",
  "sign-up",
  "forgot-password",
  "reset-password",
  "order",
  "catalog",
  "orders",
] as const;

function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
}

const DESCRIPTION_LENGTH = 150;

/** Strips markdown syntax so the plain text can be used as a meta description. */
function toDescription(body: string): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\*\*|__|\*|_|~~/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= DESCRIPTION_LENGTH) return plain;
  return `${plain.slice(0, DESCRIPTION_LENGTH - 1).trimEnd()}…`;
}

/**
 * Draft bodies open with `# <title>`, which would repeat the H1 the page
 * already renders above the body. Drop that first heading when it matches the
 * title so the page keeps a single, unique H1.
 */
function stripDuplicateLeadingHeading(body: string, title: string): string {
  const lines = body.split("\n");
  const firstIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstIndex === -1) return body;

  const firstLine = lines[firstIndex].trim();
  if (!firstLine.startsWith("# ")) return body;
  if (firstLine.slice(2).trim().toLowerCase() !== title.trim().toLowerCase()) return body;

  lines.splice(firstIndex, 1);
  return lines.join("\n");
}

interface ContentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedSlug(slug)) return { title: "Page Not Found" };

  const page = await fetchQuery(api.pages.getBySlug, { slug }).catch(() => null);
  if (!page) return { title: "Page Not Found" };

  const description = toDescription(page.body);
  return {
    title: page.title,
    description,
    openGraph: {
      title: page.title,
      description,
    },
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  if (isReservedSlug(slug)) notFound();

  const page = await fetchQuery(api.pages.getBySlug, { slug }).catch(() => null);
  if (!page) notFound();

  const body = stripDuplicateLeadingHeading(page.body, page.title);
  const updated = new Date(page.updatedAt);

  return (
    <div className="py-8 sm:py-12">
      <Container size="narrow">
        <article>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight leading-tight">
            {page.title}
          </h1>
          <p className="text-xs text-ink-subtle mt-2">
            Last updated{" "}
            <time dateTime={updated.toISOString()}>
              {updated.toLocaleDateString("en-GH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </p>
          <div className="mt-6 border-t border-line pt-6 sm:pt-8">
            <Markdown>{body}</Markdown>
          </div>
        </article>
      </Container>
    </div>
  );
}
