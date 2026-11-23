"use client";

import {
  ImagePlus,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useRef,
  useState,
} from "react";

type ImageUploaderProps = {
  productId: string;
  productName: string;
  currentImageCount: number;
  maxImages?: number;
};

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function ImageUploader({
  productId,
  productName,
  currentImageCount,
  maxImages = 5,
}: ImageUploaderProps) {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [files, setFiles] =
    useState<File[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const remainingSlots =
    Math.max(
      maxImages -
        currentImageCount,
      0,
    );

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(
          file,
        ),
      })),
    [files],
  );

  function clearSelection() {
    setFiles([]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFiles(
    selectedFiles: File[],
  ) {
    setError("");
    setSuccess("");

    if (remainingSlots <= 0) {
      setError(
        `Este producto ya tiene el máximo de ${maxImages} imágenes.`,
      );
      return;
    }

    const validFiles =
      selectedFiles.filter(
        (file) =>
          ALLOWED_TYPES.includes(
            file.type,
          ) &&
          file.size <=
            MAX_FILE_SIZE,
      );

    if (
      validFiles.length !==
      selectedFiles.length
    ) {
      setError(
        "Algunas imágenes fueron omitidas. Solo se permiten JPG, PNG o WebP de máximo 5 MB.",
      );
    }

    const allowedFiles =
      validFiles.slice(
        0,
        remainingSlots,
      );

    if (
      validFiles.length >
      remainingSlots
    ) {
      setError(
        `Solo puedes agregar ${remainingSlots} imagen${remainingSlots === 1 ? "" : "es"} más.`,
      );
    }

    setFiles(allowedFiles);
    if (allowedFiles.length > 0) void handleUpload(allowedFiles);
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFiles =
      Array.from(
        event.target.files ?? [],
      );

    handleFiles(selectedFiles);
  }

  function removeSelectedFile(
    index: number,
  ) {
    setFiles((current) =>
      current.filter(
        (_, fileIndex) =>
          fileIndex !== index,
      ),
    );
  }

  async function uploadSingleFile(
    file: File,
  ) {
    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    formData.append(
      "alt",
      productName,
    );

    const response = await fetch(
      `/api/admin/products/${productId}/images`,
      {
        method: "POST",
        body: formData,
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
          `No fue posible subir ${file.name}.`,
      );
    }
  }

  async function handleUpload(selectedFiles: File[] = files) {
    if (selectedFiles.length === 0) {
      setError(
        "Selecciona al menos una imagen.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      for (const file of selectedFiles) {
        await uploadSingleFile(
          file,
        );
      }

      const uploadedCount =
        selectedFiles.length;

      clearSelection();

      setSuccess(
        uploadedCount === 1
          ? "Imagen subida correctamente."
          : `${uploadedCount} imágenes subidas correctamente.`,
      );

      router.refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No fue posible subir las imágenes.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <ImagePlus size={24} />
        </div>

        <p className="mt-4 font-bold text-slate-900">
          Agrega imágenes del producto
        </p>

        <p className="mt-1 text-sm text-slate-500">
          JPG, PNG o WebP. Máximo
          5 MB por imagen.
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-700">
          {currentImageCount} de{" "}
          {maxImages} imágenes
          utilizadas
        </p>

        <button
          type="button"
          disabled={
            remainingSlots === 0 ||
            loading
          }
          onClick={() =>
            inputRef.current?.click()
          }
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload size={17} />
          Seleccionar imágenes
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={
            handleInputChange
          }
          className="hidden"
        />
      </div>

      {previews.length > 0 && (
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">
            Imágenes seleccionadas
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map(
              (
                preview,
                index,
              ) => (
                <div
                  key={`${preview.file.name}-${index}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="relative aspect-square bg-slate-100">
                    <img
                      src={
                        preview.url
                      }
                      alt={
                        preview.file
                          .name
                      }
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      disabled={
                        loading
                      }
                      onClick={() =>
                        removeSelectedFile(
                          index,
                        )
                      }
                      aria-label="Quitar imagen"
                      className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm transition hover:bg-white disabled:opacity-50"
                    >
                      <X
                        size={17}
                      />
                    </button>
                  </div>

                  <div className="p-4">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {
                        preview.file
                          .name
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {Math.round(
                        preview.file
                          .size /
                          1024,
                      )}{" "}
                      KB
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
        >
          {success}
        </div>
      )}

      {loading && <p role="status" className="flex items-center gap-2 text-sm text-slate-600"><Loader2 size={16} className="animate-spin" /> Subiendo imágenes automáticamente...</p>}
    </div>
  );
}
