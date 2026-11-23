"use client";

import { useState } from "react";
import { getMediaUrl } from "@/lib/media-url";

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] =
    useState(images[0] ?? "");

  if (images.length === 0) {
    return (
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
        <div className="px-8 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Imagen del producto
          </p>

          <p className="mt-3 text-2xl font-extrabold text-slate-500">
            {productName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <img
          src={getMediaUrl(selectedImage) ?? undefined}
          alt={productName}
          className="h-full w-full object-contain p-4"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((image, index) => {
            const isSelected =
              image === selectedImage;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() =>
                  setSelectedImage(image)
                }
                aria-label={`Ver imagen ${index + 1} de ${productName}`}
                className={[
                  "aspect-square overflow-hidden rounded-2xl border bg-white transition",
                  isSelected
                    ? "border-brand-950 ring-2 ring-brand-950/10"
                    : "border-slate-200 hover:border-brand-400",
                ].join(" ")}
              >
                <img
                  src={getMediaUrl(image) ?? undefined}
                  alt={`${productName}, imagen ${index + 1}`}
                  className="h-full w-full object-contain p-2"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}