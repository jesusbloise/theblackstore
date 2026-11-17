"use client";

import {
  ImagePlus,
  Loader2,
  Upload,
} from "lucide-react";
import {
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type ProductImageUploaderProps = {
  productId: string;
  productName: string;
};

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function ProductImageUploader({
  productId,
  productName,
}: ProductImageUploaderProps) {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [file, setFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [alt, setAlt] =
    useState(productName);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  function clearSelection() {
    setFile(null);
    setPreviewUrl("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile =
      event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!selectedFile) {
      clearSelection();
      return;
    }

    if (
      !ALLOWED_TYPES.includes(
        selectedFile.type,
      )
    ) {
      setError(
        "Solo se permiten imágenes JPG, PNG o WebP.",
      );

      clearSelection();
      return;
    }

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "La imagen no puede superar los 5 MB.",
      );

      clearSelection();
      return;
    }

    setFile(selectedFile);

    const localPreview =
      URL.createObjectURL(
        selectedFile,
      );

    setPreviewUrl(localPreview);
  }

  async function handleUpload() {
    if (!file) {
      setError(
        "Selecciona una imagen antes de subir.",
      );

      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      formData.append(
        "alt",
        alt.trim() || productName,
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
            "No fue posible subir la imagen.",
        );
      }

      setSuccess(
        "Imagen subida correctamente.",
      );

      clearSelection();

      router.refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No fue posible subir la imagen.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div
        className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <ImagePlus size={24} />
        </div>

        <p className="mt-4 font-bold text-slate-900">
          Selecciona una imagen
        </p>

        <p className="mt-1 text-sm text-slate-500">
          JPG, PNG o WebP. Máximo 5 MB.
        </p>

        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          <Upload size={17} />
          Elegir archivo
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {previewUrl && file && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
            <div className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="font-bold text-slate-900">
                {file.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {Math.round(
                  file.size / 1024,
                )}{" "}
                KB
              </p>

              <div className="mt-5">
                <label
                  htmlFor="product-image-alt"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Texto alternativo
                </label>

                <input
                  id="product-image-alt"
                  value={alt}
                  onChange={(event) =>
                    setAlt(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Describe brevemente la imagen para accesibilidad y SEO.
                </p>
              </div>
            </div>
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

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={
            !file || loading
          }
          onClick={handleUpload}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Subiendo...
            </>
          ) : (
            <>
              <Upload size={18} />
              Subir imagen
            </>
          )}
        </button>

        {file && (
          <button
            type="button"
            disabled={loading}
            onClick={clearSelection}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Quitar selección
          </button>
        )}
      </div>
    </div>
  );
}