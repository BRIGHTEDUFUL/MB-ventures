"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownPreview } from "./MarkdownPreview";
import { TEXTAREA_CLASS } from "./types";

type ViewMode = "write" | "preview";

interface MarkdownFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const FORMAT_HELP: ReadonlyArray<{ example: string; label: string }> = [
  { example: "## Section heading", label: "Heading" },
  { example: "**Important**", label: "Bold text" },
  { example: "[Delivery details](/delivery-and-returns)", label: "Link" },
  { example: "- First item", label: "Bullet list" },
  { example: "1. First item", label: "Numbered list" },
];

export function MarkdownField({ id, value, onChange, error }: MarkdownFieldProps) {
  const [mode, setMode] = useState<ViewMode>("write");
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label htmlFor={id} className="block text-xs font-semibold text-ink">
          Page content <span className="text-danger">*</span>
        </label>
        <span className="text-[11px] font-mono text-ink-subtle">{value.length} characters</span>
      </div>

      <Tabs value={mode} onValueChange={(next) => setMode(next as ViewMode)}>
        <TabsList aria-label="Page content view">
          <TabsTrigger type="button" value="write">
            Write
          </TabsTrigger>
          <TabsTrigger type="button" value="preview">
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write">
          <textarea
            id={id}
            rows={14}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${helpId} ${errorId}` : helpId}
            className={`${TEXTAREA_CLASS} resize-y min-h-[22rem]`}
          />
        </TabsContent>

        <TabsContent value="preview">
          <div className="rounded-md border border-line-strong bg-surface p-4 min-h-[22rem] overflow-x-auto">
            <MarkdownPreview markdown={value} />
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <p id={errorId} className="text-[11px] text-danger mt-1">
          {error}
        </p>
      )}
      <p id={helpId} className="text-[11px] text-ink-subtle mt-1">
        Markdown text. The preview shows exactly what customers read.
      </p>

      <div className="mt-3 rounded-lg border border-line bg-canvas p-4">
        <p className="text-xs font-semibold text-ink mb-2">Formatting help</p>
        <ul className="space-y-1.5">
          {FORMAT_HELP.map((row) => (
            <li
              key={row.example}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[11px]"
            >
              <code className="font-mono text-ink bg-surface border border-line rounded px-1.5 py-0.5 break-all">
                {row.example}
              </code>
              <span className="text-ink-muted">{row.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
