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
  const { addItem, items } = useCart();

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
        "Esta variante no tiene stock disponible.",
      );

      return;
    }

    const variantLabel =
      getVariantLabel(selectedVariant);

    const alreadyInCart = items.filter(item => item.variantId === selectedVariant.id).reduce((sum, item) => sum + item.quantity, 0);
    if (alreadyInCart + quantity > quantityLimit) {
      setError(`Ya tienes ${alreadyInCart} unidades en el carrito. Máximo ${quantityLimit}.`);
      return;
    }
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
  maxQuantity: quantityLimit,
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
      <div className="mt-7 rounded-sm border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
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

      {variants.length > 1 && <fieldset><legend className="mb-3 text-sm font-medium">Selecciona una variante</legend><div className="flex flex-wrap gap-2">{variants.map(v=><button key={v.id} type="button" aria-pressed={selectedVariantId===v.id} onClick={()=>handleVariantChange(v.id)} className={`border px-4 py-3 text-sm ${selectedVariantId===v.id?'border-[#101010] bg-[#101010] text-white':'border-[#d8d0c4] bg-white'} ${!isVariantAvailable(v)?'opacity-60':''}`}>{getVariantLabel(v)}{!isVariantAvailable(v)?' · Agotado':''}</button>)}</div></fieldset>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <div className="rounded-sm border border-[#e5dfd6] bg-[#F7F6F3] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              SKU
            </p>

            <p className="mt-1 text-sm font-extrabold text-[#101010]">
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
        <p className="mb-2 text-sm font-bold text-[#101010]">
          Cantidad
        </p>

        <div className="inline-flex h-12 items-center overflow-hidden rounded-sm border border-[#d8d0c4] bg-white">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            disabled={quantity === 1}
            onClick={decreaseQuantity}
            className="inline-flex h-full w-12 items-center justify-center text-[#101010] transition hover:bg-[#eee9e1] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus size={18} />
          </button>

          <div
            className="flex h-full min-w-14 items-center justify-center border-x border-[#d8d0c4] px-3 text-sm font-extrabold text-[#101010]"
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
            className="inline-flex h-full w-12 items-center justify-center text-[#101010] transition hover:bg-[#eee9e1] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus size={18} />
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Máximo {variantAvailable ? quantityLimit : 0} unidades para
          esta variante.
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
            Agregar a mi bolsa
          </>
        )}
      </Button>

      {added && (
        <div
          role="status"
          className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
        >
          Agregaste {quantity} unidad
          {quantity !== 1 ? "es" : ""} de{" "}
          {productName}, variante{" "}
          {getVariantLabel(
            selectedVariant,
          )}
          .
        </div>
      )}
    </div>
  );
}