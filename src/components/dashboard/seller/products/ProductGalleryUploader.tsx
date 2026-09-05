"use client";

import React, { useRef, useState } from "react";
import { Button, Input, Tabs } from "@heroui/react";
import {
  FaImage,
  FaLink,
  FaPlus,
  FaSpinner,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import { uploadImageToImgBB } from "@/lib/utils/imgbb";

export interface ProductGalleryUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ProductGalleryUploader({
  images,
  onImagesChange,
  maxImages = 8,
}: ProductGalleryUploaderProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const slotsRemaining = Math.max(0, maxImages - images.length);
  const isFull = slotsRemaining === 0;

  const addImageUrl = () => {
    const url = newImageUrl.trim();

    if (!url || isFull) return;

    onImagesChange([...images, url]);

    setNewImageUrl("");
    setUploadError("");
  };

  const removeImage = (idx: number) => {
    onImagesChange(images.filter((_, i) => i !== idx));
  };

  const setCoverImage = (idx: number) => {
    onImagesChange([
      images[idx],
      ...images.filter((_, i) => i !== idx),
    ]);
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setUploadError("");

    const files = Array.from(fileList).slice(0, slotsRemaining);

    if (files.length === 0) {
      setUploadError(
        `Gallery is full (${maxImages}/${maxImages}). Remove an image to add more.`,
      );
      return;
    }

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      // Upload sequentially so one failed file
      // doesn't stop the remaining uploads.
      for (const file of files) {
        try {
          const result = await uploadImageToImgBB(file);
          uploadedUrls.push(result.url);
        } catch (err: any) {
          setUploadError(
            err?.message || "One of the images failed to upload.",
          );
        }
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls]);
      }
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-muted-bg/60 p-4">
        {/* HeroUI v3 Tabs */}
        <Tabs
          selectedKey={mode}
          onSelectionChange={(key) =>
            setMode(key as "upload" | "url")
          }
          className="mb-3 w-full"
        >
          <Tabs.List
            aria-label="Image source"
            className="w-full"
          >
            <Tabs.Tab id="upload">
              <span className="flex items-center gap-1.5">
                <FaUpload size={10} />
                Upload from Device
              </span>

              <Tabs.Indicator />
            </Tabs.Tab>

            <Tabs.Tab id="url">
              <span className="flex items-center gap-1.5">
                <FaLink size={10} />
                Paste Image URL
              </span>

              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Upload Mode */}
        {mode === "upload" ? (
          <label
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-6 text-center transition ${
              isFull
                ? "cursor-not-allowed border-border opacity-60"
                : "cursor-pointer border-border hover:border-primary hover:bg-primary/5"
            }`}
          >
            {isUploading ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <FaSpinner
                  className="animate-spin"
                  size={12}
                />
                Uploading to ImgBB...
              </span>
            ) : (
              <>
                <FaUpload className="text-xl text-primary" />

                <span className="text-xs font-bold text-text">
                  {isFull
                    ? "Gallery full"
                    : "Click to select image(s)"}
                </span>

                <span className="text-[10px] text-muted">
                  JPG, PNG or WebP · up to {slotsRemaining} more
                  image
                  {slotsRemaining === 1 ? "" : "s"}
                </span>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={isUploading || isFull}
              onChange={(e) =>
                handleFilesSelected(e.target.files)
              }
              className="hidden"
            />
          </label>
        ) : (
          /* URL Mode */
          <>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-text">
              <FaLink
                size={11}
                className="text-primary"
              />
              Quick Add Image URL
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={newImageUrl}
                onChange={(e) =>
                  setNewImageUrl(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
                placeholder="https://images.unsplash.com/... or CDN link"
                fullWidth
                disabled={isFull}
              />

              <Button
                type="button"
                variant="primary"
                onPress={addImageUrl}
                isDisabled={
                  isFull || !newImageUrl.trim()
                }
                className="shrink-0"
              >
                <FaPlus size={11} /> Add
              </Button>
            </div>
          </>
        )}

        {/* Error */}
        {uploadError && (
          <p className="mt-2 text-[11px] font-semibold text-error">
            {uploadError}
          </p>
        )}

        {/* Gallery Info */}
        <p className="mt-2 text-[11px] text-muted">
          Up to {maxImages} images ({images.length}/{maxImages}{" "}
          used). The first image is used as the main cover on the
          product page.
        </p>
      </div>

      {/* Gallery */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((src, idx) => (
            <div
              key={`${src}-${idx}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted-bg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Product visual ${idx + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (
                    e.target as HTMLImageElement
                  ).style.opacity = "0.15";
                }}
              />

              {/* Top Controls */}
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1.5">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold shadow-sm ${
                    idx === 0
                      ? "bg-primary text-white"
                      : "bg-surface/90 text-text"
                  }`}
                >
                  {idx === 0
                    ? "Main Cover"
                    : `Angle ${idx + 1}`}
                </span>

                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="grid h-6 w-6 place-items-center rounded-full bg-surface/90 text-text shadow-sm transition hover:text-error"
                >
                  <FaTrash size={9} />
                </button>
              </div>

              {/* Set Cover */}
              {idx !== 0 && (
                <div className="absolute inset-x-0 bottom-0 flex justify-center bg-surface/90 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setCoverImage(idx)}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Set as cover
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
          <FaImage className="text-2xl text-muted" />

          <p className="text-xs text-muted">
            No images yet — upload a file or add an image URL
            above.
          </p>
        </div>
      )}
    </div>
  );
}

