"use client";

import { ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";
import { FOCUS_CLASS } from "./types";

export const renderStatusButton = (
  row: { name: string; isActive: boolean },
  onToggle: () => void
) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={`${row.isActive ? "Active" : "Inactive"}: toggle status for ${row.name}`}
    className={`min-h-11 min-w-11 px-3 inline-flex items-center justify-center rounded text-[11px] font-semibold transition-colors ${FOCUS_CLASS} ${
      row.isActive ? "bg-success-soft text-success" : "bg-canvas-strong text-ink-subtle"
    }`}
  >
    {row.isActive ? "Active" : "Inactive"}
  </button>
);

export const renderSortControls = (
  reordering: boolean,
  name: string,
  sortOrder: number,
  index: number,
  length: number,
  onMove: (index: number, direction: -1 | 1) => void
) => (
  <div className="flex items-center gap-1">
    <span className="font-mono text-ink-muted w-6 text-right">{sortOrder}</span>
    <button
      type="button"
      onClick={() => onMove(index, -1)}
      disabled={reordering || index === 0}
      aria-label={`Move ${name} up`}
      title="Move up"
      className={`p-1.5 rounded hover:bg-canvas text-ink-muted hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_CLASS}`}
    >
      <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
    <button
      type="button"
      onClick={() => onMove(index, 1)}
      disabled={reordering || index === length - 1}
      aria-label={`Move ${name} down`}
      title="Move down"
      className={`p-1.5 rounded hover:bg-canvas text-ink-muted hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_CLASS}`}
    >
      <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  </div>
);

export const renderActionButtons = (
  name: string,
  onEdit: () => void,
  onDelete: () => void,
  editLabel: string,
  deleteLabel: string
) => (
  <div className="flex items-center justify-end gap-1.5">
    <button
      type="button"
      onClick={onEdit}
      aria-label={`${editLabel} ${name}`}
      title={editLabel}
      className={`p-1.5 rounded hover:bg-canvas text-ink-muted hover:text-ink transition-colors ${FOCUS_CLASS}`}
    >
      <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
    <button
      type="button"
      onClick={onDelete}
      aria-label={`${deleteLabel} ${name}`}
      title={deleteLabel}
      className={`p-1.5 rounded hover:bg-danger-soft text-ink-muted hover:text-danger transition-colors ${FOCUS_CLASS}`}
    >
      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  </div>
);
