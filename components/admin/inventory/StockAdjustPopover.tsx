"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import {
  ADJUST_REASON_OPTIONS,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  FOCUS_CLASS,
  INPUT_CLASS,
  MAX_NOTE_LENGTH,
  TEXTAREA_CLASS,
  type AdjustMode,
  type AdjustReason,
} from "./types";

interface StockAdjustPopoverProps {
  productId: Id<"products">;
  name: string;
  stock: number;
  reserved: number;
}

interface FormState {
  mode: AdjustMode;
  value: string;
  reason: AdjustReason;
  note: string;
}

function initialState(stock: number): FormState {
  return { mode: "set", value: String(stock), reason: "restock", note: "" };
}

const MODE_BUTTON = `h-11 px-3 rounded-md text-xs font-semibold transition-colors ${FOCUS_CLASS}`;

/** Per-row stock adjustment form. Closes on success, keeps the error visible otherwise. */
export function StockAdjustPopover({ productId, name, stock, reserved }: StockAdjustPopoverProps) {
  const adjustStock = useMutation(api.productsAdmin.adjustStock);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialState(stock));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setForm(initialState(stock));
      setError(null);
    }
  };

  const changeMode = (mode: AdjustMode) => {
    if (mode === form.mode) return;
    setForm((prev) => ({ ...prev, mode, value: mode === "set" ? String(stock) : "0" }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const value = Number(form.value);
    if (form.value.trim() === "" || !Number.isInteger(value)) {
      setError("Enter a whole number of units.");
      return;
    }
    if (form.mode === "set" && value < 0) {
      setError("Stock cannot be negative.");
      return;
    }
    if (form.mode === "add" && value === 0) {
      setError("Enter a change other than zero.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await adjustStock({
        productId,
        mode: form.mode,
        value,
        reason: form.reason,
        note: form.note.trim() || undefined,
      });
      toast.success(`Stock updated for "${name}". ${result.available} available now.`);
      setOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to adjust stock.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`h-11 px-3 rounded-md border border-line bg-surface text-xs font-semibold text-ink hover:border-line-strong hover:bg-canvas transition-colors ${FOCUS_CLASS}`}
          aria-label={`Adjust stock for ${name}`}
        >
          Adjust
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <h3 className="font-heading font-semibold text-sm text-ink">Adjust stock</h3>
            <p className="text-[11px] font-mono text-ink-muted mt-0.5 break-words">{name}</p>
            <p className="text-[11px] font-mono text-ink-muted">
              On hand {stock} · Reserved {reserved}
            </p>
          </div>

          <div>
            <span className="block text-xs font-semibold text-ink mb-1">Adjustment type</span>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-canvas" role="group">
              <button
                type="button"
                aria-pressed={form.mode === "set"}
                onClick={() => changeMode("set")}
                className={`${MODE_BUTTON} ${
                  form.mode === "set"
                    ? "bg-surface border border-line-strong text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Set
              </button>
              <button
                type="button"
                aria-pressed={form.mode === "add"}
                onClick={() => changeMode("add")}
                className={`${MODE_BUTTON} ${
                  form.mode === "add"
                    ? "bg-surface border border-line-strong text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label htmlFor={`stock-value-${productId}`} className="block text-xs font-semibold text-ink mb-1">
              {form.mode === "set" ? "New stock level" : "Change by"}
            </label>
            <input
              id={`stock-value-${productId}`}
              type="number"
              step={1}
              inputMode="numeric"
              value={form.value}
              onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
              className={INPUT_CLASS}
            />
            <p className="text-[11px] text-ink-muted mt-1">
              {form.mode === "set"
                ? "Physical units on hand after saving."
                : "Whole units to add, or a negative number to remove."}
            </p>
          </div>

          <div>
            <label htmlFor={`stock-reason-${productId}`} className="block text-xs font-semibold text-ink mb-1">
              Reason
            </label>
            <select
              id={`stock-reason-${productId}`}
              value={form.reason}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reason: e.target.value as AdjustReason }))
              }
              className={INPUT_CLASS}
            >
              {ADJUST_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`stock-note-${productId}`} className="block text-xs font-semibold text-ink mb-1">
              Note (optional)
            </label>
            <textarea
              id={`stock-note-${productId}`}
              rows={2}
              maxLength={MAX_NOTE_LENGTH}
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="e.g. Delivery note 4471"
              className={TEXTAREA_CLASS}
            />
            <p className="text-[11px] text-ink-muted mt-1">
              {form.note.length}/{MAX_NOTE_LENGTH} characters
            </p>
          </div>

          {error && (
            <p role="alert" className="text-[11px] font-semibold text-danger">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={BUTTON_SECONDARY}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className={`${BUTTON_PRIMARY} disabled:opacity-50`}>
              {saving ? "Saving..." : "Apply"}
            </button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
