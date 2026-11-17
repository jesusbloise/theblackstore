"use client";

import {
  Check,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
} from "react";

import { useCart } from "@/components/cart/CartProvider";
import {
  calculateMattressPrice,
  formatPrice,
  recognizeMattressSize,
} from "@/components/products/custom-mattress/config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";



type CustomMattressConfiguratorProps = {
  productId: string;
  productName: string;
  productImage?: string;

  density?: string;
  minimumLengthCm?: number;
  maximumLengthCm?: number;
  minimumWidthCm?: number;
  maximumWidthCm?: number;
  allowedThicknessCm?: number[];
  basePricePerSquareM?: number;
};

export function CustomMattressConfigurator({
  productId,
  productName,
  productImage,
  density = "D21",
  minimumLengthCm = 50,
  maximumLengthCm = 250,
  minimumWidthCm = 50,
  maximumWidthCm = 250,
  allowedThicknessCm = [10, 15, 20],
  basePricePerSquareM = 72000,
}: CustomMattressConfiguratorProps) {

  const { addItem } = useCart();

  const [length, setLength] =
    useState("190");

  const [width, setWidth] =
    useState("105");

  const [thickness, setThickness] =
    useState(15);

  const [quantity, setQuantity] =
    useState(1);

  const [added, setAdded] =
    useState(false);

  const [isAdding, setIsAdding] =
    useState(false);

  const [error, setError] =
    useState("");

  const addedTimeoutRef = useRef<number | null>(null);

  const numericLength =
    Number(length);

  const numericWidth =
    Number(width);

  const recognizedSize = useMemo(
    () =>
      recognizeMattressSize(
        numericLength,
        numericWidth,
      ),
    [numericLength, numericWidth],
  );

  const isCustomSize =
    numericLength >= 50 &&
    numericWidth >= 50 &&
    !recognizedSize;

  const unitPrice = useMemo(() => {
    if (
      !numericLength ||
      !numericWidth ||
      numericLength <= 0 ||
      numericWidth <= 0
    ) {
      return 0;
    }

    const areaFactor =
      (numericLength * numericWidth) / 10000;

    const thicknessFactor =
      thickness / 10;

    const calculatedPrice =
      basePricePerSquareM *
      areaFactor *
      thicknessFactor;

    return (
      Math.round(calculatedPrice / 1000) *
      1000
    );
  }, [
    numericLength,
    numericWidth,
    thickness,
    basePricePerSquareM,
  ]);

  const totalPrice =
    unitPrice * quantity;

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(1, current - 1),
    );
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(10, current + 1),
    );
  }

  async function handleAddToCart() {
    if (isAdding) {
      return;
    }

    if (
      !Number.isFinite(numericLength) ||
      !Number.isFinite(numericWidth) ||
      numericLength < minimumLengthCm ||
      numericLength > maximumLengthCm ||
      numericWidth < minimumWidthCm ||
      numericWidth > maximumWidthCm
    ) {
      setError(
        `Ingresa un largo entre ${minimumLengthCm} y ${maximumLengthCm} cm, y un ancho entre ${minimumWidthCm} y ${maximumWidthCm} cm.`,
      );

      return;
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0
    ) {
      setError(
        "No fue posible calcular el precio. Revisa las medidas ingresadas.",
      );

      return;
    }



    setError("");
    setAdded(false);
    setIsAdding(true);

    const configurationLabel =
      `${numericLength} × ${numericWidth} × ${thickness} cm`;

    try {
      addItem({
        id: productId,
        name: productName,
        image: productImage,
        href: "/producto/colchon-a-medida",
        price: unitPrice,
        quantity,
        subtitle: configurationLabel,
        dimensioned: true,

        configuration: {
          length: numericLength,
          width: numericWidth,
          thickness,
          label: configurationLabel,
        },

        metadata: {
          length: numericLength,
          width: numericWidth,
          thickness,
          density,
          custom_product: true,
        },
      });

      setAdded(true);

      if (addedTimeoutRef.current) {
        window.clearTimeout(
          addedTimeoutRef.current,
        );
      }

      addedTimeoutRef.current =
        window.setTimeout(() => {
          setAdded(false);
        }, 2500);
    } catch (error) {
      console.error(
        "No se pudo agregar el colchón al carrito:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "No fue posible agregar el colchón al carrito.",
      );
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="mt-7">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-950 text-sm font-extrabold text-white">
            D21
          </span>

          <div>
            <p className="font-extrabold text-brand-950">
              Densidad de fabricación
            </p>

            <p className="mt-1 text-sm leading-5 text-slate-600">
              Este colchón se fabrica
              exclusivamente con espuma de
              densidad D21.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-extrabold text-brand-950">
          Ingresa las medidas
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Todos los valores están expresados
          en centímetros.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Largo"
            name="length"
            type="number"
            min={50}
            max={250}
            value={length}
            onChange={(event) => {
              setLength(
                event.target.value,
              );
              setError("");
              setAdded(false);
            }}
          />

          <Input
            label="Ancho"
            name="width"
            type="number"
            min={50}
            max={250}
            value={width}
            onChange={(event) => {
              setWidth(
                event.target.value,
              );
              setError("");
              setAdded(false);
            }}
          />
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm font-bold text-brand-950">
            Alto o espesor
          </p>

          <div className="grid grid-cols-3 gap-3">
            {allowedThicknessCm.map(
              (thicknessValue) => {
                const option = {
                  value: thicknessValue,
                  label: `${thicknessValue} cm`,
                };

                const isSelected =
                  thickness === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setThickness(
                        option.value,
                      );
                      setError("");
                      setAdded(false);
                    }}
                    className={[
                      "min-h-11 rounded-xl border px-3 text-sm font-bold transition",
                      isSelected
                        ? "border-brand-950 bg-brand-50 text-brand-950 ring-2 ring-brand-950/10"
                        : "border-slate-200 bg-white text-slate-600 hover:border-brand-300",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {recognizedSize && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Check size={15} />
              </span>

              <div>
                <p className="text-sm font-extrabold text-emerald-950">
                  Equivale a{" "}
                  {recognizedSize.name}
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-800">
                  Corresponde a una medida
                  estándar.
                </p>
              </div>
            </div>
          </div>
        )}

        {isCustomSize && (
          <div className="mt-4 rounded-xl border border-accent-300 bg-accent-50 p-3">
            <p className="text-sm font-extrabold text-brand-950">
              Fabricación personalizada
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              El colchón será fabricado
              especialmente con las
              dimensiones ingresadas.
            </p>
          </div>
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

      <div className="mt-6 border-t border-slate-200 pt-5">
        <p className="text-sm text-slate-500">
          Configuración seleccionada
        </p>

        <p className="mt-1 text-lg font-black text-brand-950">
          {length || 0} × {width || 0} ×{" "}
          {thickness} cm
        </p>

        <div className="mt-5 flex items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-sm font-bold text-brand-950">
              Cantidad
            </p>

            <div className="inline-flex h-11 items-center overflow-hidden rounded-xl border border-slate-300 bg-white">
              <button
                type="button"
                aria-label="Disminuir cantidad"
                disabled={quantity === 1}
                onClick={() => {
                  decreaseQuantity();
                  setAdded(false);
                }}
                className="inline-flex h-full w-11 items-center justify-center transition hover:bg-slate-100 disabled:opacity-35"
              >
                <Minus size={17} />
              </button>

              <div className="flex h-full min-w-12 items-center justify-center border-x border-slate-300 px-3 text-sm font-extrabold">
                {quantity}
              </div>

              <button
                type="button"
                aria-label="Aumentar cantidad"
                disabled={quantity === 10}
                onClick={() => {
                  increaseQuantity();
                  setAdded(false);
                }}
                className="inline-flex h-full w-11 items-center justify-center transition hover:bg-slate-100 disabled:opacity-35"
              >
                <Plus size={17} />
              </button>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500">
              Total estimado
            </p>

            <p className="mt-1 text-3xl font-black text-brand-950">
              {formatPrice(totalPrice)}
            </p>

            {quantity > 1 && (
              <p className="mt-1 text-xs text-slate-500">
                {formatPrice(unitPrice)} por
                unidad
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Button
          type="button"
          size="lg"
          fullWidth
          disabled={isAdding}
          onClick={handleAddToCart}
        >
          {isAdding ? (
            <>
              <ShoppingCart size={20} />
              Agregando...
            </>
          ) : added ? (
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
      </div>

      {added && (
        <Link
          href="/carrito"
          className="mt-3 flex w-full items-center justify-center rounded-xl border border-brand-950 px-5 py-3 text-sm font-extrabold text-brand-950 transition hover:bg-brand-50"
        >
          Ver carrito
        </Link>
      )}

      <p className="mt-3 text-center text-xs text-slate-500">
        Tiempo estimado de fabricación:
        12 días hábiles.
      </p>
    </div>
  );
}