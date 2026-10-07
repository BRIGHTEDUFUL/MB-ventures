import { FOCUS_CLASS } from "./types";

interface PagerProps {
  offset: number;
  limit: number;
  total: number;
  hasMore: boolean;
  onOffsetChange: (offset: number) => void;
  label: string;
}

const PAGER_BUTTON = `h-11 px-4 rounded-md border border-line-strong bg-surface text-xs font-semibold text-ink hover:bg-canvas disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${FOCUS_CLASS}`;

/** Offset Prev/Next footer shared by the inventory tables. */
export function Pager({ offset, limit, total, hasMore, onOffsetChange, label }: PagerProps) {
  if (total === 0) return null;

  const from = offset + 1;
  const to = Math.min(offset + limit, total);

  return (
    <nav
      aria-label={label}
      className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line px-4 py-3"
    >
      <p className="text-[11px] font-mono text-ink-muted">
        Showing {from}-{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={offset === 0}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          className={PAGER_BUTTON}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!hasMore}
          onClick={() => onOffsetChange(offset + limit)}
          className={PAGER_BUTTON}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
