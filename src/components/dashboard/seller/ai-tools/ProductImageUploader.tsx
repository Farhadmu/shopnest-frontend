"use client";

import React, { useCallback, useRef, useState } from "react";
import { uploadImagesToImgBB, MAX_IMGBB_FILE_SIZE_MB } from "@/lib/utils/imgbb";

export interface ProductImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ProductImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}: ProductImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slotsRemaining = Math.max(0, maxImages - images.length);
  const isFull = slotsRemaining === 0;

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || disabled) return;

      const files = Array.from(fileList).slice(0, slotsRemaining);
      if (files.length === 0) {
        setUploadError(`Maximum ${maxImages} images allowed. Remove an image to add more.`);
        return;
      }

      setUploadError("");
      setIsUploading(true);

      try {
        const validFiles = files.filter((f) => f.type.startsWith("image/"));
        if (validFiles.length !== files.length) {
          setUploadError("Only JPG, PNG, and WEBP images are supported.");
        }
        if (validFiles.length === 0) {
          setIsUploading(false);
          return;
        }

        const urls = await uploadImagesToImgBB(validFiles);
        onImagesChange([...images, ...urls]);
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : "Image upload failed. Please try again.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [images, onImagesChange, slotsRemaining, maxImages, disabled]
  );

  const removeImage = (idx: number) => {
    onImagesChange(images.filter((_, i) => i !== idx));
  };

  const setCoverImage = (idx: number) => {
    onImagesChange([images[idx], ...images.filter((_, i) => i !== idx)]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isFull) setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled && !isFull) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40"
        } ${isFull || disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isFull && !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          disabled={isUploading || isFull || disabled}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        {isUploading ? (
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading images...
          </div>
        ) : isFull ? (
          <p className="text-sm font-bold text-muted">Gallery full ({maxImages}/{maxImages})</p>
        ) : (
          <>
            <p className="text-sm font-bold text-text">Drag & drop product images here</p>
            <p className="mt-1 text-xs text-muted">or click to browse</p>
            <p className="mt-2 text-[10px] text-muted">
              JPG, JPEG, PNG, WEBP • Max {MAX_IMGBB_FILE_SIZE_MB}MB per image • Up to {maxImages} images
            </p>
          </>
        )}
      </div>

      {uploadError && (
        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{uploadError}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted-bg"
            >
              <img
                src={src}
                alt={`Product image ${idx + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.2";
                }}
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1.5">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold shadow-sm ${
                    idx === 0 ? "bg-primary text-white" : "bg-surface/90 text-text"
                  }`}
                >
                  {idx === 0 ? "Primary" : `Image ${idx + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="grid h-6 w-6 place-items-center rounded-full bg-surface/90 text-text shadow-sm transition hover:text-rose-500"
                  title="Remove image"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {idx !== 0 && (
                <div className="absolute inset-x-0 bottom-0 flex justify-center bg-surface/90 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setCoverImage(idx)}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Set as primary
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
