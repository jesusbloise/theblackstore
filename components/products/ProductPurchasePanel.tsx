"use client";

import {
  Check,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { Select } from "@/components/ui/Select";

type PurchaseVariant = {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  manageInventory: boolean;
  allowBackorder: boolean;
  attributes: {
    name: string;
    value: string;
  }[];
};

type ProductPurchasePanelProps = {
  productId: string;
  productName: string;
  productHref: string;
  productImage?: string;
  variants: PurchaseVariant[];
  dimensioned?: boolean;
  maxQuantity?: number;
};

function getVariantLabel(
  variant: PurchaseVariant,
) {
  const attributeValues =
    variant.attributes
      .map((attribute) => attribute.value)
      .filter(Boolean);

  return (
    attributeValues.join(" / ") ||
    variant.name
  );
}

function isVariantAvailable(
  variant: PurchaseVariant,
) {
  if (!variant.manageInventory) {
    return true;
  }

  if (variant.allowBackorder) {
    return true;
  }

  return variant.stock > 0;
}

export function ProductPurchasePanel({
  productId,
  productName,
  productHref,
  productImage,
  variants,
  dimensioned = false,
  maxQuantity = 10,
}: ProductPurchasePanelProps) {
  const { addItem } = useCart();

  const firstAvailableVariant =
    variants.find(isVariantAvailable) ??
    variants[0];

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState(
    firstAvailableVariant?.id ?? "",
  );

  const [quantity, setQuantity] =
    useState(1);

  const [added, setAdded] =
    useState(false);

  const [error, setError] =
    useState("");

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (variant) =>
          variant.id === selectedVariantId,
      ) ?? null,
    [selectedVariantId, variants],
  );

  const variantAvailable =
    selectedVariant
      ? isVariantAvailable(
          selectedVariant,
        )
      : false;

  const quantityLimit = useMemo(() => {
    if (!selectedVariant) {
      return 1;
    }

    if (
      !selectedVariant.manageInventory ||
      selectedVariant.allowBackorder
    ) {
      return maxQuantity;
    }

    return Math.max(
      1,
      Math.min(
        maxQuantity,
        selectedVariant.stock,
      ),
    );
  }, [
    maxQuantity,
    selectedVariant,
  ]);

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(1, current - 1),
    );

    setAdded(false);
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(
        quantityLimit,
        current + 1,
      ),
    );

    setAdded(false);
  }

  function handleVariantChange(
    variantId: string,
  ) {
    setSelectedVariantId(variantId);
    setQuantity(1);
    setError("");
    setAdded(false);
  }

  function handleAddToCart() {
    if (!selectedVariant) {
      setError(
        "Selecciona una variante antes de agregar el producto.",
      );

      return;
    }

    if (!variantAvailable) {
      setError(
        "Esta medida no tiene stock disponible.",
      );

      return;
    }

    const variantLabel =
      getVariantLabel(selectedVariant);

    setError("");

 addItem({
  id: productId,
  variantId: selectedVariant.id,
  cartItemId: selectedVariant.id,
  name: productName,
  image: productImage,
  href: productHref,
  price: selectedVariant.price,
  quantity,
  subtitle: variantLabel,
  dimensioned,
  metadata: {
    sku: selectedVariant.sku,
  },
});

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2500);
  }

  if (
    variants.length === 0 ||
    !selectedVariant
  ) {
    return (
      <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
        Este producto todavía no tiene variantes
        disponibles para comprar.
      </div>
    );
  }

  return (
    <div className="mt-7 space-y-6">
      <Price
        price={selectedVariant.price}
        originalPrice={
          selectedVariant.compareAtPrice
        }
        size="lg"
      />

      <Select
        label="Medida"
        name="variant"
        value={selectedVariantId}
        error={error}
        required
        onChange={(event) =>
          handleVariantChange(
            event.target.value,
          )
        }
      >
        {variants.map((variant) => {
          const available =
            isVariantAvailable(variant);

          return (
            <option
              key={variant.id}
              value={variant.id}
              disabled={!available}
            >
              {getVariantLabel(variant)}
              {!available
                ? " — Agotado"
                : ""}
            </option>
          );
        })}
      </Select>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              SKU
            </p>

            <p className="mt-1 text-sm font-extrabold text-brand-950">
              {selectedVariant.sku}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Disponibilidad
            </p>

            <p
              className={[
                "mt-1 text-sm font-extrabold",
                variantAvailable
                  ? "text-emerald-700"
                  : "text-red-600",
              ].join(" ")}
            >
              {variantAvailable
                ? selectedVariant.manageInventory &&
                  !selectedVariant.allowBackorder
                  ? `${selectedVariant.stock} disponibles`
                  : "Disponible"
                : "Sin stock"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-bold text-brand-950">
          Cantidad
        </p>

        <div className="inline-flex h-12 items-center overflow-hidden rounded-xl border border-slate-300 bg-white">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            disabled={quantity === 1}
            onClick={decreaseQuantity}
            className="inline-flex h-full w-12 items-center justify-center text-brand-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus size={18} />
          </button>

          <div
            className="flex h-full min-w-14 items-center justify-center border-x border-slate-300 px-3 text-sm font-extrabold text-brand-950"
            aria-live="polite"
          >
            {quantity}
          </div>

          <button
            type="button"
            aria-label="Aumentar cantidad"
            disabled={
              !variantAvailable ||
              quantity >= quantityLimit
            }
            onClick={increaseQuantity}
            className="inline-flex h-full w-12 items-center justify-center text-brand-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus size={18} />
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Máximo {quantityLimit} unidades para
          esta medida.
        </p>
      </div>

      <Button
        type="button"
        size="lg"
        fullWidth
        disabled={!variantAvailable}
        onClick={handleAddToCart}
      >
        {added ? (
          <>
            <Check size={20} />
            Producto agregado
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            Agregar al carrito
          </>
        )}
      </Button>

      {added && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
        >
          Agregaste {quantity} unidad
          {quantity !== 1 ? "es" : ""} de{" "}
          {productName}, medida{" "}
          {getVariantLabel(
            selectedVariant,
          )}
          .
        </div>
      )}
    </div>
  );
}