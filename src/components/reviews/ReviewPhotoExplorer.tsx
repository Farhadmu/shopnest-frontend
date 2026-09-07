"use client";

import React, { useState } from "react";
import { FiImage, FiStar, FiX, FiCheckCircle, FiUser } from "react-icons/fi";

export interface ReviewPhotoItem {
  id: string;
  imageUrl: string;
  rating: number;
  userName: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export function ReviewPhotoExplorer({ photos }: { photos: ReviewPhotoItem[] }) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState<ReviewPhotoItem | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-card border border-dashed border-border text-center text-muted">
        <FiImage className="mx-auto text-2xl mb-2 text-muted" />
        <p className="text-xs font-semibold">No customer review photos uploaded yet.</p>
        <p className="text-[11px] text-muted mt-0.5">Be the first verified customer to share an unboxing photo!</p>
      </div>
    );
  }

  const filtered = selectedRating
    ? photos.filter((p) => Math.round(p.rating) === selectedRating)
    : photos;

  return (
    <div className="space-y-4">
      {/* Header & Rating Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiImage className="text-primary text-base" />
          <h4 className="text-sm font-extrabold text-foreground">
            Customer Photo Gallery ({photos.length})
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedRating(null)}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
              selectedRating === null
                ? "bg-primary text-white"
                : "bg-surface text-muted hover:text-foreground border border-border"
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRating(r)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all ${
                selectedRating === r
                  ? "bg-primary text-white"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              }`}
            >
              <span>{r}</span>
              <FiStar className="fill-amber-400 text-amber-400" size={10} />
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Images */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {filtered.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActivePhoto(photo)}
            className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted-bg shadow-sm hover:ring-2 hover:ring-primary transition-all cursor-pointer"
          >
            <img
              src={photo.imageUrl}
              alt="Customer Review"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span className="text-[10px] text-white font-bold flex items-center gap-0.5">
                <FiStar className="fill-amber-400 text-amber-400" /> {photo.rating}★
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Fullscreen Photo & Context Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Image Preview */}
            <div className="flex-1 bg-black/40 min-h-[260px] md:min-h-[360px] flex items-center justify-center relative">
              <img
                src={activePhoto.imageUrl}
                alt="Enlarged customer photo"
                className="max-h-[360px] w-full object-contain"
              />
            </div>

            {/* Review Details */}
            <div className="w-full md:w-72 p-6 flex flex-col justify-between space-y-4 bg-card border-t md:border-t-0 md:border-l border-border">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <FiUser />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">{activePhoto.userName}</span>
                      {activePhoto.verifiedPurchase && (
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                          <FiCheckCircle /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePhoto(null)}
                    className="text-muted hover:text-foreground p-1"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={12}
                      className={i < activePhoto.rating ? "fill-amber-400" : "text-border"}
                    />
                  ))}
                  <span className="text-xs font-bold text-foreground ml-1">{activePhoto.rating}.0</span>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed italic">
                  "{activePhoto.comment}"
                </p>
              </div>

              <span className="text-[10px] text-muted">
                Uploaded on {new Date(activePhoto.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
