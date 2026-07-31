"use client";

import {
  Check,
  ChevronRight,
  Factory,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  PackageOpen,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart/CartProvider";
import { Container } from "@/components/ui/Container";
import type {
  DeliveryMethod,
  DeliveryZone,
} from "@/lib/types/cart";

const SANTIAGO_SHIPPING_PRICE = 8990;

const WHATSAPP_NUMBER = "56912345678";

function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function ProgressStepper() {
  const steps = [
    {
      label: "Carrito",
      active: true,
    },
    {
      label: "Datos y pago",
      active: false,
    },
    {
      label: "Confirmación",
      active: false,
    },
  ];

  return (
    <div className="mb-7 flex items-center">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className={[
            "flex items-center",
            index < steps.length - 1
              ? "flex-1"
              : "",
          ].join(" ")}
        >
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={[
                "flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold",
                step.active
                  ? "border-[#1B3A6B] bg-[#1B3A6B] text-white"
                  : "border-slate-200 bg-slate-50 text-slate-400",
              ].join(" ")}
            >
              {index + 1}
            </span>

            <span
              className={[
                "hidden text-[13px] sm:block",
                step.active
                  ? "font-semibold text-slate-900"
                  : "font-normal text-slate-400",
              ].join(" ")}
            >
              {step.label}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div className="mx-3 h-0.5 flex-1 bg-slate-200" />
          )}
        </div>
      ))}
    </div>
  );
}

type DestinationSelectorProps = {
  value: DeliveryZone;
  onChange: (zone: DeliveryZone) => void;
};

function DestinationSelector({
  value,
  onChange,
}: DestinationSelectorProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-[10px] border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2.5">
        <MapPin
          size={17}
          className="text-[#1B3A6B]"
        />

        <span className="text-[13px] font-semibold text-slate-900">
          ¿Dónde entregaremos?
        </span>
      </div>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange("santiago")}
          className={[
            "rounded-lg border-[1.5px] px-4 py-1.5 text-[13px] font-semibold transition",
            value === "santiago"
              ? "border-[#1B3A6B] bg-[#1B3A6B] text-white"
              : "border-slate-200 bg-white text-slate-500 hover:border-[#1B3A6B]",
          ].join(" ")}
        >
          Santiago
        </button>

        <button
          type="button"
          onClick={() => onChange("region")}
          className={[
            "rounded-lg border-[1.5px] px-4 py-1.5 text-[13px] font-semibold transition",
            value === "region"
              ? "border-[#1B3A6B] bg-[#1B3A6B] text-white"
              : "border-slate-200 bg-white text-slate-500 hover:border-[#1B3A6B]",
          ].join(" ")}
        >
          Región
        </button>
      </div>
    </div>
  );
}

type DeliveryOptionProps = {
  id: DeliveryMethod;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  selected: boolean;
  onChange: (method: DeliveryMethod) => void;
};

function DeliveryOption({
  id,
  title,
  subtitle,
  icon,
  selected,
  onChange,
}: DeliveryOptionProps) {
  return (
    <label
      className={[
        "flex flex-1 cursor-pointer items-center gap-3 rounded-[10px] border-[1.5px] px-3 py-3 transition",
        selected
          ? "border-[#1D4ED8] bg-[#EFF6FF]"
          : "border-slate-200 bg-white hover:border-slate-300",
      ].join(" ")}
    >
      <input
        type="radio"
        name="delivery"
        checked={selected}
        onChange={() => onChange(id)}
        className="size-4 accent-[#1D4ED8]"
      />

      <span className="text-[#1B3A6B]">
        {icon}
      </span>

      <span>
        <span className="block text-sm font-semibold text-slate-900">
          {title}
        </span>

        <span className="mt-0.5 block text-xs text-slate-500">
          {subtitle}
        </span>
      </span>
    </label>
  );
}

type InfoBannerProps = {
  type: "blue" | "amber";
  title: string;
  description?: string;
};

function InfoBanner({
  type,
  title,
  description,
}: InfoBannerProps) {
  const isAmber = type === "amber";

  return (
    <div
      className={[
        "flex gap-2.5 rounded-lg border px-3.5 py-2.5",
        isAmber
          ? "border-amber-200 bg-amber-50"
          : "border-blue-200 bg-blue-50",
      ].join(" ")}
    >
      <span
        className={
          isAmber
            ? "text-amber-700"
            : "text-blue-700"
        }
      >
        {isAmber ? (
          <Package size={17} />
        ) : (
          <Check size={17} />
        )}
      </span>

      <div>
        <p className="text-[13px] font-semibold text-slate-900">
          {title}
        </p>

        {description && (
          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  const {
    items,
    subtotal,
    deliveryMethod,
    deliveryZone,
    hasDimensionedProducts,
    isHydrated,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    setDeliveryMethod,
    setDeliveryZone,
  } = useCart();

  const toRegion =
    deliveryZone === "region";

  const isPickup =
    deliveryMethod === "pickup";

  const shipping =
    isPickup
      ? 0
      : toRegion
        ? null
        : SANTIAGO_SHIPPING_PRICE;

  const total =
    subtotal + (shipping ?? 0);

  const whatsappMessage =
    encodeURIComponent(
      "Hola, necesito cotizar el despacho de un producto dimensionado de mi carrito Incal.",
    );

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  if (!isHydrated) {
    return (
      <main className="min-h-[65vh] bg-[#F8FAFC] py-8">
        <Container>
          <div className="mx-auto h-96 max-w-[1000px] animate-pulse rounded-2xl bg-white" />
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#F8FAFC] py-6 sm:py-8">
      <Container>
        <div className="mx-auto max-w-[1000px]">
          <ProgressStepper />

          <DestinationSelector
            value={deliveryZone}
            onChange={setDeliveryZone}
          />

          {items.length === 0 ? (
            <section className="rounded-[14px] border border-slate-200 bg-white px-6 py-14 text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <PackageOpen size={29} />
              </span>

              <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
                Tu carrito está vacío
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Agrega productos para comenzar
                tu compra.
              </p>

              <Link
                href="/colchones"
                className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-[#1B3A6B] px-5 py-3 text-sm font-semibold text-white"
              >
                Ver colchones
                <ChevronRight size={17} />
              </Link>
            </section>
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h1 className="text-lg font-bold text-slate-900">
                    Tu carrito
                  </h1>

                  <Link
                    href="/colchones"
                    className="text-xs font-semibold text-[#1D4ED8] hover:underline"
                  >
                    Seguir comprando
                  </Link>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <article
                      key={item.cartItemId}
                      className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <Link
                        href={item.href ?? "#"}
                        className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <ShoppingBag
                            size={23}
                            className="text-slate-400"
                          />
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={item.href ?? "#"}
                          className="block truncate text-sm font-semibold text-slate-900 hover:text-[#1D4ED8]"
                        >
                          {item.name}
                        </Link>

                        {item.subtitle && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.subtitle}
                          </p>
                        )}

                        {item.dimensioned &&
                          toRegion &&
                          !isPickup && (
                            <span className="mt-1 inline-block rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                              Producto dimensionado ·
                              envío a cotizar
                            </span>
                          )}
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <p className="text-[15px] font-bold text-slate-900">
                            {formatCLP(
                              item.price *
                                item.quantity,
                            )}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.cartItemId,
                              )
                            }
                            aria-label={`Eliminar ${item.name}`}
                            className="ml-1 flex size-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="mt-1.5 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.cartItemId,
                              )
                            }
                            className="flex size-[26px] items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus size={13} />
                          </button>

                          <span className="min-w-5 text-center text-sm font-semibold text-slate-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.cartItemId,
                              )
                            }
                            className="flex size-[26px] items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="rounded-[14px] border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
                <div>
                  <p className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.05em] text-slate-500">
                    Entrega
                  </p>

                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-row">
                    <DeliveryOption
                      id="shipping"
                      title="Despacho"
                      subtitle={
                        toRegion
                          ? "Región a cotizar"
                          : "A domicilio"
                      }
                      icon={<Truck size={19} />}
                      selected={
                        deliveryMethod ===
                        "shipping"
                      }
                      onChange={
                        setDeliveryMethod
                      }
                    />

                    <DeliveryOption
                      id="pickup"
                      title="Retiro"
                      subtitle="En bodega · Gratis"
                      icon={<Factory size={19} />}
                      selected={
                        deliveryMethod ===
                        "pickup"
                      }
                      onChange={
                        setDeliveryMethod
                      }
                    />
                  </div>

                  {isPickup && (
                    <div className="mt-2.5">
                      <InfoBanner
                        type="blue"
                        title="Espera nuestro mensaje de confirmación antes de retirar."
                      />
                    </div>
                  )}

                  {!isPickup &&
                    toRegion &&
                    hasDimensionedProducts && (
                      <div className="mt-2.5">
                        <InfoBanner
                          type="amber"
                          title="Producto dimensionado detectado"
                          description="El envío a región debe coordinarse por WhatsApp."
                        />
                      </div>
                    )}
                </div>

                <div className="my-4 h-px bg-slate-200" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="text-slate-900">
                      {formatCLP(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Envío
                    </span>

                    <span
                      className={
                        isPickup
                          ? "font-semibold text-green-600"
                          : "text-slate-900"
                      }
                    >
                      {isPickup
                        ? "Gratis"
                        : toRegion
                          ? "A cotizar"
                          : formatCLP(
                              SANTIAGO_SHIPPING_PRICE,
                            )}
                    </span>
                  </div>
                </div>

                <div className="my-4 h-px bg-slate-200" />

                <div className="flex items-center justify-between text-[17px] font-bold text-slate-900">
                  <span>Total</span>

                  <span>
                    {!isPickup && toRegion
                      ? "A definir"
                      : formatCLP(total)}
                  </span>
                </div>

                {!isPickup &&
toRegion &&
hasDimensionedProducts ? (
  <button
    type="button"
    disabled
    className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-[10px] bg-slate-300 px-6 py-[13px] text-[15px] font-semibold text-white"
  >
    Ir al pago
    <ChevronRight size={17} />
  </button>
) : (
  <Link
    href="/checkout"
    className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#1B3A6B] px-6 py-[13px] text-[15px] font-semibold text-white transition hover:opacity-90"
  >
    Ir al pago
    <ChevronRight size={17} />
  </Link>
)}

                {!isPickup &&
                  toRegion &&
                  hasDimensionedProducts && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-[13px] font-semibold text-emerald-800"
                    >
                      <MessageCircle size={16} />
                      Cotizar envío por WhatsApp
                    </a>
                  )}

                {!toRegion && (
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-[#1B3A6B]"
                  >
                    <MessageCircle size={14} />
                    ¿Dudas sobre el envío?
                  </a>
                )}
              </aside>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}