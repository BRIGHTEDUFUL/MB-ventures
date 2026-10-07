"use client";

import React from "react";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { Image as ImageIcon, UploadCloud } from "lucide-react";
import type { ImageValue } from "./model";
import { SECONDARY_BTN } from "./model";

/* -------------------------------------------------------------------------- */
/* Small building blocks                                                       */
/* -------------------------------------------------------------------------- */

export interface FieldProps {
  id: string;
  label: string;
  helper?: string;
  required?: boolean;
  children: (fieldId: string) => React.ReactNode;
}

export function Field({ id, label, helper, required, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-ink mb-1">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children(id)}
      {helper && <p className="text-[11px] text-ink-subtle mt-1 leading-tight">{helper}</p>}
    </div>
  );
}

export interface SwitchFieldProps {
  id: string;
  label: string;
  helper: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function SwitchField({ id, label, helper, checked, onCheckedChange }: SwitchFieldProps) {
  return (
    <div className="flex items-center justify-between gap-3 border border-line rounded-lg p-4">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-xs font-semibold text-ink">
          {label}
        </label>
        <p className="text-[11px] text-ink-subtle mt-1 leading-tight">{helper}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export interface ImageFieldProps {
  id: string;
  label: string;
  helperText: string;
  value: ImageValue;
  uploading: boolean;
  onUpload: (file: File) => Promise<ImageValue | null>;
  onChange: (next: ImageValue) => void;
  previewClassName?: string;
}

export function ImageField({
  id,
  label,
  helperText,
  value,
  uploading,
  onUpload,
  onChange,
  previewClassName = "h-40",
}: ImageFieldProps) {
  const handleFile = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const next = await onUpload(file);
    if (next) onChange(next);
  };

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-ink">{label}</span>

      {value.previewUrl ? (
        <div className={`relative w-full ${previewClassName} rounded-md overflow-hidden border border-line bg-canvas`}>
          <Image
            src={value.previewUrl}
            alt={`${label} preview`}
            width={640}
            height={320}
            unoptimized
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className={`w-full ${previewClassName} rounded-md border border-line bg-canvas flex flex-col items-center justify-center gap-2 text-ink-muted`}
        >
          <ImageIcon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-xs">No image selected</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={id}
          className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-md border border-line bg-surface text-xs font-semibold text-ink hover:bg-canvas cursor-pointer transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-focus disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UploadCloud className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{value.previewUrl ? "Change image" : "Upload image"}</span>
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              void handleFile(e.target.files);
              e.target.value = "";
            }}
          />
        </label>

        {value.previewUrl && (
          <button
            type="button"
            onClick={() => onChange({ imageId: null, previewUrl: null })}
            disabled={uploading}
            className={SECONDARY_BTN}
          >
            Remove image
          </button>
        )}
      </div>

      <p className="text-[11px] text-ink-subtle leading-tight">{helperText}</p>
    </div>
  );
}
