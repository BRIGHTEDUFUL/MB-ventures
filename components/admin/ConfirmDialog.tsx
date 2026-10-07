"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-line p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="font-heading font-bold text-lg text-ink">{title}</DialogTitle>
          <DialogDescription className="text-sm text-ink-muted leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-4 border-t border-line">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="h-11 px-4 rounded-md border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`h-11 px-4 rounded-md text-xs font-semibold text-surface transition-colors flex items-center justify-center disabled:opacity-50 ${
              variant === "danger" ? "bg-danger hover:bg-danger/90" : "bg-ink hover:bg-brand-hover"
            }`}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
