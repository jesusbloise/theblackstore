"use client";

import {
  GripVertical,
  Loader2,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import { ImageActions } from "./ImageActions";
import type { ProductImage } from "./types";

type ImageGalleryProps = {
  productId: string;
  productName: string;
  images: ProductImage[];
};

export function ImageGallery({
  productId,
  productName,
  images,
}: ImageGalleryProps) {
  const [orderedImages, setOrderedImages] =
    useState(images);

  const [draggedImageId, setDraggedImageId] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * Si router.refresh() trae cambios desde
   * el servidor, sincronizamos nuevamente
   * la galería.
   */
  useEffect(() => {
    setOrderedImages(images);
  }, [images]);

  function handleDragStart(
    imageId: string,
  ) {
    setDraggedImageId(imageId);
    setError("");
    setSuccess("");
  }

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
  }

  function handleDrop(
    targetImageId: string,
  ) {
    if (
      !draggedImageId ||
      draggedImageId === targetImageId
    ) {
      setDraggedImageId(null);
      return;
    }

    setOrderedImages(
      (currentImages) => {
        const nextImages =
          [...currentImages];

        const sourceIndex =
          nextImages.findIndex(
            (image) =>
              image.id ===
              draggedImageId,
          );

        const targetIndex =
          nextImages.findIndex(
            (image) =>
              image.id ===
              targetImageId,
          );

        if (
          sourceIndex === -1 ||
          targetIndex === -1
        ) {
          return currentImages;
        }

        const [movedImage] =
          nextImages.splice(
            sourceIndex,
            1,
          );

        nextImages.splice(
          targetIndex,
          0,
          movedImage,
        );

        return nextImages;
      },
    );

    setDraggedImageId(null);
  }

  function handleDragEnd() {
    setDraggedImageId(null);
  }

  async function handleSaveOrder() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/products/${productId}/images/reorder`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              imageIds:
                orderedImages.map(
                  (image) =>
                    image.id,
                ),
            }),
          },
        );

      const result =
        (await response.json()) as {
          ok: boolean;
          message?: string;
        };

      if (
        !response.ok ||
        !result.ok
      ) {
        throw new Error(
          result.message ??
            "No fue posible guardar el orden.",
        );
      }

      /*
       * Actualizamos localmente el
       * sortOrder para que la interfaz
       * quede inmediatamente consistente.
       */
      setOrderedImages(
        (currentImages) =>
          currentImages.map(
            (image, index) => ({
              ...image,
              sortOrder:
                index + 1,
            }),
          ),
      );

      setSuccess(
        "Orden guardado correctamente.",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No fue posible guardar el orden.",
      );

      /*
       * Si algo falla, recuperamos el
       * orden recibido originalmente.
       */
      setOrderedImages(images);
    } finally {
      setSaving(false);
    }
  }

  const originalIds =
    images.map(
      (image) => image.id,
    );

  const currentIds =
    orderedImages.map(
      (image) => image.id,
    );

  const orderChanged =
    originalIds.join("|") !==
    currentIds.join("|");

  if (
    orderedImages.length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">
            Imágenes guardadas
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Arrastra las tarjetas para
            cambiar el orden de la galería.
          </p>
        </div>

        {orderChanged && (
          <button
            type="button"
            disabled={saving}
            onClick={
              handleSaveOrder
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {saving
              ? "Guardando..."
              : "Guardar orden"}
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
        >
          {success}
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orderedImages.map(
          (image, index) => {
            const isDragging =
              draggedImageId ===
              image.id;

            return (
              <div
                key={image.id}
                draggable={
                  !saving
                }
                onDragStart={() =>
                  handleDragStart(
                    image.id,
                  )
                }
                onDragOver={
                  handleDragOver
                }
                onDrop={() =>
                  handleDrop(
                    image.id,
                  )
                }
                onDragEnd={
                  handleDragEnd
                }
                className={[
                  "overflow-hidden rounded-2xl border bg-white transition",
                  isDragging
                    ? "scale-[0.98] border-slate-400 opacity-50"
                    : "border-slate-200",
                  saving
                    ? "pointer-events-none"
                    : "cursor-grab active:cursor-grabbing",
                ].join(" ")}
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={`/api/media?key=${encodeURIComponent(
                      image.url,
                    )}`}
                    alt={
                      image.alt ||
                      productName
                    }
                    draggable={false}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm">
                    <GripVertical
                      size={18}
                    />
                  </div>

                  {image.isPrimary && (
                    <span className="absolute left-3 top-3 rounded-full bg-slate-950 px-3 py-1 text-xs font-extrabold text-white">
                      Principal
                    </span>
                  )}

                  <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-slate-700 shadow-sm">
                    {index + 1}
                  </span>
                </div>

                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-bold text-slate-900">
                    {image.alt ||
                      productName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Orden:{" "}
                    {index + 1}
                  </p>

                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <ImageActions
                      productId={
                        productId
                      }
                      imageId={
                        image.id
                      }
                      imageAlt={
                        image.alt
                      }
                      isPrimary={
                        image.isPrimary
                      }
                    />
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>

      {orderChanged && (
        <p className="mt-4 text-sm font-semibold text-amber-700">
          Tienes cambios de orden
          pendientes. Pulsa
          &quot;Guardar orden&quot; para
          conservarlos.
        </p>
      )}
    </div>
  );
}