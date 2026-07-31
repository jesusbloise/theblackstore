"use client";

import { useState } from "react";
import {
  Check,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

type ProductPurchasePanelProps = {
  productId: string;
  productName: string;
  productPrice: number;
  productHref: string;
  sizes: string[];
  maxQuantity?: number;
};

export function ProductPurchasePanel({
  productId,
  productName,
  productPrice,
  productHref,
  sizes,
  maxQuantity = 10,
}: ProductPurchasePanelProps) {
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [added, setAdded] =
    useState(false);

  const [error, setError] =
    useState("");

  function decreaseQuantity() {
    setQuantity((currentQuantity) =>
      Math.max(1, currentQuantity - 1),
    );
  }

  function increaseQuantity() {
    setQuantity((currentQuantity) =>
      Math.min(
        maxQuantity,
        currentQuantity + 1,
      ),
    );
  }

  function handleAddToCart() {
    if (!selectedSize) {
      setError(
        "Selecciona una medida antes de agregar el producto.",
      );

      return;
    }

    setError("");

addItem({
  id: productId,
  cartItemId: `${productId}-${selectedSize}`,
  name: productName,
  price: productPrice,
  quantity,
  subtitle: selectedSize,
  href: productHref,
});
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2500);
  }

  return (
    <div className="mt-8 space-y-6">
      <Select
        label="Tamaño"
        name="size"
        value={selectedSize}
        error={error}
        required
        onChange={(event) => {
          setSelectedSize(
            event.target.value,
          );

          setError("");
        }}
      >
        <option value="" disabled>
          Selecciona una medida
        </option>

        {sizes.map((size) => (
          <option
            key={size}
            value={size}
          >
            {size}
          </option>
        ))}
      </Select>

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
              quantity === maxQuantity
            }
            onClick={increaseQuantity}
            className="inline-flex h-full w-12 items-center justify-center text-brand-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus size={18} />
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Máximo {maxQuantity} unidades por
          compra.
        </p>
      </div>

      <Button
        type="button"
        size="lg"
        fullWidth
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
          {selectedSize}.
        </div>
      )}
    </div>
  );
}