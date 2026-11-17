"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type VariantFormInitialData = {
  id: string;
  name: string;
  sku: string;

  price: number;
  compareAtPrice?: number | null;

  stock: number;

  measure?: string;
  density?: string;
  height?: string;

  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;

  manageInventory: boolean;
  allowBackorder: boolean;
  isActive: boolean;
};

type VariantFormProps = {
  productId: string;
  initialData?: VariantFormInitialData;
};

function parseInteger(value: string) {
  const normalized =
    value.replace(/\D/g, "");

  return normalized
    ? Number(normalized)
    : 0;
}

function parseOptionalInteger(
  value: string,
) {
  const normalized =
    value.replace(/\D/g, "");

  return normalized
    ? Number(normalized)
    : null;
}

export function VariantForm({
  productId,
  initialData,
}: VariantFormProps) {
  const router = useRouter();

  const isEditing =
    Boolean(initialData?.id);

  const [name, setName] =
    useState(
      initialData?.name ?? "",
    );

  const [measure, setMeasure] =
    useState(
      initialData?.measure ?? "",
    );

  const [density, setDensity] =
    useState(
      initialData?.density ?? "",
    );

  const [height, setHeight] =
    useState(
      initialData?.height ?? "",
    );

  const [sku, setSku] =
    useState(
      initialData?.sku ?? "",
    );

  const [price, setPrice] =
    useState(
      initialData
        ? String(initialData.price)
        : "",
    );

  const [
    compareAtPrice,
    setCompareAtPrice,
  ] = useState(
    initialData?.compareAtPrice
      ? String(
          initialData.compareAtPrice,
        )
      : "",
  );

  const [stock, setStock] =
    useState(
      initialData
        ? String(initialData.stock)
        : "0",
    );

  const [lengthCm, setLengthCm] =
    useState(
      initialData?.lengthCm
        ? String(initialData.lengthCm)
        : "",
    );

  const [widthCm, setWidthCm] =
    useState(
      initialData?.widthCm
        ? String(initialData.widthCm)
        : "",
    );

  const [heightCm, setHeightCm] =
    useState(
      initialData?.heightCm
        ? String(initialData.heightCm)
        : "",
    );

  const [
    manageInventory,
    setManageInventory,
  ] = useState(
    initialData?.manageInventory ??
      true,
  );

  const [
    allowBackorder,
    setAllowBackorder,
  ] = useState(
    initialData?.allowBackorder ??
      false,
  );

  const [isActive, setIsActive] =
    useState(
      initialData?.isActive ??
        true,
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const endpoint = isEditing
        ? `/api/admin/products/${productId}/variants/${initialData?.id}`
        : `/api/admin/products/${productId}/variants`;

      const response =
        await fetch(endpoint, {
          method: isEditing
            ? "PATCH"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),

            measure:
              measure.trim() ||
              undefined,

            density:
              density.trim() ||
              undefined,

            height:
              height.trim() ||
              undefined,

            sku: sku
              .trim()
              .toUpperCase(),

            price:
              parseInteger(price),

            compareAtPrice:
              compareAtPrice.trim()
                ? parseInteger(
                    compareAtPrice,
                  )
                : null,

            stock:
              parseInteger(stock),

            lengthCm:
              parseOptionalInteger(
                lengthCm,
              ),

            widthCm:
              parseOptionalInteger(
                widthCm,
              ),

            heightCm:
              parseOptionalInteger(
                heightCm,
              ),

            manageInventory,
            allowBackorder,
            isActive,
          }),
        });

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
            "No fue posible guardar la variante.",
        );
      }

      router.push(
        `/admin/productos/${productId}/editar`,
      );

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No fue posible guardar la variante.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* INFORMACIÓN */}

      <section>
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-900">
            Información de la variante
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Define la combinación que verá
            el cliente en la tienda.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="variant-name"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Nombre de la variante
            </label>

            <input
              id="variant-name"
              value={name}
              required
              placeholder="Ej: 2 Plazas / D21 / 20 cm"
              onChange={(event) => {
                setName(
                  event.target.value,
                );

                setError("");
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              htmlFor="variant-sku"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              SKU
            </label>

            <input
              id="variant-sku"
              value={sku}
              required
              placeholder="Ej: CEA-2P-D21-20"
              onChange={(event) =>
                setSku(
                  event.target.value.toUpperCase(),
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono uppercase outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>
      </section>

      {/* OPCIONES */}

      <section className="border-t border-slate-200 pt-8">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-900">
            Opciones del producto
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Estas opciones serán utilizadas
            por la ficha pública del producto.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label
              htmlFor="variant-measure"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Medida
            </label>

            <input
              id="variant-measure"
              value={measure}
              placeholder="Ej: 2 Plazas"
              onChange={(event) =>
                setMeasure(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              htmlFor="variant-density"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Densidad
            </label>

            <input
              id="variant-density"
              value={density}
              placeholder="Ej: 21"
              onChange={(event) =>
                setDensity(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              htmlFor="variant-height"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Altura comercial
            </label>

            <input
              id="variant-height"
              value={height}
              placeholder="Ej: 20 cm"
              onChange={(event) =>
                setHeight(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>
      </section>

      {/* DIMENSIONES */}

      <section className="border-t border-slate-200 pt-8">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-900">
            Dimensiones físicas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Datos utilizados en ficha técnica,
            despacho y logística.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <DimensionField
            id="variant-length"
            label="Largo"
            value={lengthCm}
            placeholder="190"
            onChange={setLengthCm}
          />

          <DimensionField
            id="variant-width"
            label="Ancho"
            value={widthCm}
            placeholder="150"
            onChange={setWidthCm}
          />

          <DimensionField
            id="variant-height-cm"
            label="Alto"
            value={heightCm}
            placeholder="20"
            onChange={setHeightCm}
          />
        </div>
      </section>

      {/* PRECIOS */}

      <section className="border-t border-slate-200 pt-8">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-900">
            Precio
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Define el precio específico para
            esta combinación.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="variant-price"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Precio de venta
            </label>

            <input
              id="variant-price"
              type="number"
              min={0}
              step={1}
              value={price}
              required
              placeholder="199990"
              onChange={(event) =>
                setPrice(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

            <p className="mt-2 text-xs text-slate-500">
              Ingresa pesos completos sin
              puntos.
            </p>
          </div>

          <div>
            <label
              htmlFor="variant-compare-price"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Precio anterior
            </label>

            <input
              id="variant-compare-price"
              type="number"
              min={0}
              step={1}
              value={compareAtPrice}
              placeholder="Opcional"
              onChange={(event) =>
                setCompareAtPrice(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

            <p className="mt-2 text-xs text-slate-500">
              Se utilizará para mostrar
              descuentos y ofertas.
            </p>
          </div>
        </div>
      </section>

      {/* INVENTARIO */}

      <section className="border-t border-slate-200 pt-8">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-900">
            Inventario
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configura la disponibilidad de
            esta variante.
          </p>
        </div>

        <div>
          <label
            htmlFor="variant-stock"
            className="mb-2 block text-sm font-bold text-slate-800"
          >
            Stock
          </label>

          <input
            id="variant-stock"
            type="number"
            min={0}
            step={1}
            value={stock}
            required
            onChange={(event) =>
              setStock(
                event.target.value,
              )
            }
            className="w-full max-w-sm rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={manageInventory}
              onChange={(event) =>
                setManageInventory(
                  event.target.checked,
                )
              }
              className="mt-1 size-4"
            />

            <span>
              <span className="block font-bold text-slate-800">
                Controlar inventario
              </span>

              <span className="text-sm text-slate-500">
                Limita las compras según el
                stock disponible.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={allowBackorder}
              onChange={(event) =>
                setAllowBackorder(
                  event.target.checked,
                )
              }
              className="mt-1 size-4"
            />

            <span>
              <span className="block font-bold text-slate-800">
                Permitir compra sin stock
              </span>

              <span className="text-sm text-slate-500">
                Permite vender productos
                fabricables bajo pedido.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(
                  event.target.checked,
                )
              }
              className="mt-1 size-4"
            />

            <span>
              <span className="block font-bold text-slate-800">
                Variante activa
              </span>

              <span className="text-sm text-slate-500">
                Las variantes inactivas no
                estarán disponibles en la tienda.
              </span>
            </span>
          </label>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear variante"}
        </button>

        <Link
          href={`/admin/productos/${productId}/editar`}
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

type DimensionFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (
    value: string,
  ) => void;
};

function DimensionField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: DimensionFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-slate-800"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type="number"
          min={1}
          step={1}
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
          cm
        </span>
      </div>
    </div>
  );
}