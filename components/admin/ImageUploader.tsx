"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { validateImageFile, optimizeImage } from "@/lib/image";
import { toast } from "sonner";
import { UploadCloud, X, ChevronLeft, ChevronRight, Loader2, Star } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export interface ImageItem {
  storageId: Id<"_storage">;
  url: string;
}

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 8,
  label = "Product Images",
  helperText = "Upload up to 8 images (JPEG, PNG, WebP up to 5 MB). First image is the primary catalog photo.",
  disabled = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || disabled) return;

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      toast.error(`Maximum of ${maxImages} images allowed.`);
      return;
    }

    const filesToProcess = Array.from(fileList).slice(0, availableSlots);
    setIsUploading(true);

    const uploadedItems: ImageItem[] = [];

    for (const file of filesToProcess) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || `File ${file.name} is invalid.`);
        continue;
      }

      try {
        // Optimize on client (canvas WebP compression)
        const optimizedFile = await optimizeImage(file);

        // 1. Get Convex upload URL
        const uploadUrl = await generateUploadUrl();

        // 2. Upload file blob directly to Convex storage
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": optimizedFile.type },
          body: optimizedFile,
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        const { storageId } = await response.json();

        // Create temporary preview URL for immediate display
        const previewUrl = URL.createObjectURL(optimizedFile);

        uploadedItems.push({
          storageId: storageId as Id<"_storage">,
          url: previewUrl,
        });
      } catch (err: unknown) {
        console.error("Image upload error:", err);
        const msg = err instanceof Error ? err.message : `Failed to upload ${file.name}`;
        toast.error(msg);
      }
    }

    if (uploadedItems.length > 0) {
      onChange([...images, ...uploadedItems]);
      toast.success(
        `Uploaded ${uploadedItems.length} image${uploadedItems.length > 1 ? "s" : ""}.`
      );
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    const updated = [...images];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-ink">
            {label} ({images.length}/{maxImages})
          </label>
          {images.length > 0 && (
            <span className="text-[11px] text-ink-muted">
              Use arrows to reorder. 1st image is Main.
            </span>
          )}
        </div>
      )}

      {/* Upload Dropzone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-brand bg-brand-soft"
              : "border-line hover:border-line-strong hover:bg-canvas"
          } ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxImages > 1}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={disabled || isUploading}
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-ink animate-spin" />
                <p className="text-xs font-medium text-ink">Optimizing and uploading image...</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-canvas border border-line flex items-center justify-center text-ink-muted">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">
                    Click to select or drag and drop photos
                  </p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    JPEG, PNG, or WebP up to 5 MB per file
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Thumbnails Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {images.map((item, index) => (
            <div
              key={item.storageId}
              className={`relative aspect-square rounded-lg border bg-canvas overflow-hidden flex items-center justify-center p-2 group transition-shadow ${
                index === 0 ? "border-brand ring-1 ring-brand" : "border-line"
              }`}
            >
              <Image
                src={item.url}
                alt={`Photo ${index + 1}`}
                width={160}
                height={160}
                unoptimized
                className="w-full h-full object-contain"
              />

              {/* Main Badge */}
              {index === 0 && (
                <div className="absolute top-1.5 left-1.5 bg-ink text-surface text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 z-10">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>Main</span>
                </div>
              )}

              {/* Action Buttons Toolbar Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-ink/90 p-1.5 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveLeft(index);
                    }}
                    title="Move left"
                    aria-label="Move photo left"
                    className="w-6 h-6 rounded bg-surface/20 hover:bg-surface text-surface hover:text-ink disabled:opacity-20 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveRight(index);
                    }}
                    title="Move right"
                    aria-label="Move photo right"
                    className="w-6 h-6 rounded bg-surface/20 hover:bg-surface text-surface hover:text-ink disabled:opacity-20 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  title="Remove image"
                  aria-label="Remove photo"
                  className="w-6 h-6 rounded bg-danger/80 hover:bg-danger text-surface flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {helperText && <p className="text-[11px] text-ink-subtle leading-tight">{helperText}</p>}
    </div>
  );
}
