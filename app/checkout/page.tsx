"use client";

import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  Landmark,
  MapPin,
  PackageOpen,
  ShieldCheck,
  Truck,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Container } from "@/components/ui/Container";

const SANTIAGO_SHIPPING_PRICE = 8990;

type PaymentMethod =
  | "webpay"
  | "mercado-pago"
  | "transferencia";

type OrderConfirmation = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingAmount: number;
  total: number;
};

function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function CheckoutStepper() {
  const steps = [
    {
      number: 1,
      label: "Carrito",
      completed: true,
      active: false,
    },
    {
      number: 2,
      label: "Datos y pago",
      completed: false,
      active: true,
    },
    {
      number: 3,
      label: "Confirmación",
      completed: false,
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
            index < steps.length - 1 ? "flex-1" : "",
          ].join(" ")}
        >
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={[
                "flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold",
                step.completed
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : step.active
                    ? "border-[#101010] bg-[#101010] text-white"
                    : "border-[#e8e5df] bg-brand-50 text-neutral-500",
              ].join(" ")}
            >
              {step.completed ? <Check size={14} /> : step.number}
            </span>

            <span
              className={[
                "hidden text-[13px] sm:block",
                step.active
                  ? "font-semibold text-brand-950"
                  : step.completed
                    ? "font-medium text-emerald-600"
                    : "font-normal text-neutral-500",
              ].join(" ")}
            >
              {step.label}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={[
                "mx-3 h-0.5 flex-1",
                step.completed ? "bg-emerald-600" : "bg-brand-200",
              ].join(" ")}
            />
          )}
        </div>
      ))}
    </div>
  );
}

type FormFieldProps = {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
};

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  autoComplete,
}: FormFieldProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
      )}

      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-sm border border-brand-200 bg-white px-3.5 text-sm text-brand-950 outline-none transition placeholder:text-neutral-500 focus:border-[#101010] focus:ring-2 focus:ring-[#101010]/10"
      />
    </label>
  );
}

type PaymentOptionProps = {
  id: PaymentMethod;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
};

function PaymentOption({
  id,
  label,
  description,
  selected,
  onSelect,
  icon,
}: PaymentOptionProps) {
  return (
    <label
      htmlFor={id}
      className={[
        "flex cursor-pointer items-center gap-3 rounded-sm border-[1.5px] px-4 py-3 transition",
        selected
          ? "border-accent-400 bg-accent-50"
          : "border-[#e8e5df] bg-white hover:border-brand-200",
      ].join(" ")}
    >
      <input
        id={id}
        type="radio"
        name="paymentMethod"
        value={id}
        checked={selected}
        onChange={onSelect}
        className="size-4 shrink-0 accent-brand-950"
      />

      <span
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          selected
            ? "bg-white text-brand-700"
            : "bg-brand-100 text-neutral-600",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="min-w-0">
        <span className="block text-sm font-semibold text-brand-950">
          {label}
        </span>

        <span className="mt-0.5 block text-xs text-neutral-600">
          {description}
        </span>
      </span>
    </label>
  );
}

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    deliveryMethod,
    deliveryZone,
    isHydrated,
    clearCart,
  } = useCart();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("webpay");

  const [needsInvoice, setNeedsInvoice] =
    useState(false);

  const [confirmation, setConfirmation] =
    useState<OrderConfirmation | null>(null);

  const pendingRequest = useRef<{
    key: string;
    payload: string;
  } | null>(null);

  const submitting = useRef(false);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  const isPickup =
    deliveryMethod === "pickup";

  const isRegion =
    deliveryZone === "region";

  const shippingPrice =
    isPickup || isRegion
      ? 0
      : SANTIAGO_SHIPPING_PRICE;

  const total =
    subtotal + shippingPrice;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting.current) return;

    setValidationError("");

    if (needsInvoice) {
      setValidationError("La facturación todavía no está habilitada.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const field = (name: string) =>
      String(form.get(name) ?? "").trim();

    if (!isPickup && (
      isRegion ||
      field("region") !== "Región Metropolitana"
    )) {
      setValidationError("El despacho regional requiere cotización previa.");
      return;
    }

    if (items.some(item => !item.variantId || item.dimensioned)) {
      setValidationError("El carrito contiene productos que requieren cotización.");
      return;
    }

    const payload = {
      customer: {
        firstName: field("firstName"),
        lastName: field("lastName"),
        email: field("email"),
        phone: field("phone"),
      },
      deliveryMethod,
      paymentMethod,
      ...(!isPickup && {
        address: {
          street: field("street"),
          streetNumber: field("streetNumber"),
          commune: field("commune"),
          city: field("city"),
          region: field("region"),
          apartment: field("apartment") || undefined,
        },
      }),
      items: items.map(({ id, variantId, quantity, price }) => ({
        id,
        variantId,
        quantity,
        price,
      })),
    };

    const serialized = JSON.stringify(payload);

    if (
      pendingRequest.current &&
      pendingRequest.current.payload !== serialized
    ) {
      setValidationError(
        "Existe un intento de compra anterior. Reintenta con los mismos datos para evitar pedidos duplicados."
      );
      return;
    }

    submitting.current = true;
    setValidating(true);

    try {
      if (!pendingRequest.current) {
        pendingRequest.current = {
          key: crypto.randomUUID(),
          payload: serialized,
        };
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          idempotencyKey: pendingRequest.current.key,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          pendingRequest.current = null;
        }

        throw new Error(
          result.error || "No se pudo crear el pedido."
        );
      }

      if (typeof result.orderNumber !== "string") {
        throw new Error("No se pudo confirmar el pedido.");
      }

      setConfirmation(result);
      pendingRequest.current = null;
      clearCart();

    } catch (error) {
      setValidationError(
        error instanceof Error
          ? error.message
          : "No se pudo crear el pedido."
      );
    } finally {
      submitting.current = false;
      setValidating(false);
    }
  }

  if (!isHydrated) {
    return (
      <main className="min-h-[70vh] bg-[#F7F6F3] py-8">
        <Container>
          <div className="mx-auto h-96 max-w-[1120px] animate-pulse rounded-2xl bg-white" />
        </Container>
      </main>
    );
  }
if (confirmation) {
  return (
    <main className="min-h-[70vh] bg-[#F7F6F3] py-12">
      <Container>
        <section className="mx-auto max-w-[700px] rounded-md border border-[#e8e5df] bg-white px-6 py-12 text-center">

          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check size={38} />
          </span>

          <h1 className="mt-6 text-3xl font-bold text-brand-950">
            ¡Pedido recibido!
          </h1>

          <p className="mt-3 text-sm text-neutral-600">
            Tu pedido ha sido registrado correctamente.
          </p>

          <div className="mt-6 rounded-md bg-brand-50 p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              Número de pedido
            </p>

            <p className="mt-2 break-all text-sm font-bold text-brand-950">
              {confirmation.orderNumber}
            </p>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCLP(confirmation.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Despacho</span>
              <span>
                {confirmation.shippingAmount === 0
                  ? "Gratis"
                  : formatCLP(confirmation.shippingAmount)}
              </span>
            </div>

            <div className="flex justify-between border-t border-brand-200 pt-4 text-lg font-bold">
              <span>Total</span>
              <span>{formatCLP(confirmation.total)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
            Pago pendiente. Todavía no se ha realizado ningún cobro.
          </div>

          <Link
            href="/productos"
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-[#101010] px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Seguir comprando
            <ChevronRight size={17} />
          </Link>

        </section>
      </Container>
    </main>
  );
}
  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#F7F6F3] py-10">
        <Container>
          <section className="mx-auto max-w-[700px] rounded-md border border-[#e8e5df] bg-white px-6 py-14 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-100 text-neutral-500">
              <PackageOpen size={29} />
            </span>

            <h1 className="mt-5 text-2xl font-extrabold text-brand-950">
              No tienes productos para pagar
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Primero agrega productos a tu carrito.
            </p>

            <Link
              href="/productos"
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-[#101010] px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
            >
              Ver productos
              <ChevronRight size={17} />
            </Link>
          </section>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#F7F6F3] py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-[1120px]">
          <CheckoutStepper />
          <h1 className="mb-6 text-2xl font-semibold tracking-tight text-brand-950 sm:text-3xl">Finalizar compra</h1>

          <Link
            href="/carrito"
            className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-neutral-600 transition hover:text-[#101010]"
          >
            <ArrowLeft size={15} />
            Volver al carrito
          </Link>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <form
              id="checkout-form"
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              {/* Datos de contacto */}
              <section className="rounded-md border border-[#e8e5df] bg-white p-5">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-neutral-600">
                  Datos de contacto
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <FormField
  name="firstName"
  placeholder="Nombre"
  required
  autoComplete="given-name"
/>

<FormField
  name="lastName"
  placeholder="Apellido"
  required
  autoComplete="family-name"
/>

                  <FormField
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    autoComplete="email"
                  />

                  <FormField
                    name="phone"
                    type="tel"
                    placeholder="Teléfono"
                    required
                    autoComplete="tel"
                  />
                </div>
              </section>

              {/* Dirección o retiro */}
              {isPickup ? (
                <section className="flex items-start gap-3 rounded-md border-[1.5px] border-emerald-200 bg-emerald-50 p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700">
                    <Building2 size={19} />
                  </span>

                  <div>
                    <h2 className="text-sm font-bold text-brand-950">
                      Retiro en bodega
                    </h2>

                    <p className="mt-1 text-[13px] leading-5 text-neutral-600">
                      No necesitas ingresar una dirección. Te
                      avisaremos por WhatsApp cuando tu pedido esté
                      listo para retirar.
                    </p>
                  </div>
                </section>
              ) : (
                <section className="rounded-md border border-[#e8e5df] bg-white p-5">
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-neutral-600">
                    Dirección de entrega
                  </h2>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <FormField
  name="street"
  placeholder="Calle"
  required
  autoComplete="address-line1"
/>

<FormField
  name="streetNumber"
  placeholder="Número"
  required
/>

<FormField
  name="apartment"
  placeholder="Departamento o casa (opcional)"
  autoComplete="address-line2"
/>

<FormField
  name="city"
  placeholder="Ciudad"
  required
/>

                    <FormField
                      name="commune"
                      placeholder="Comuna"
                      required
                      autoComplete="address-level2"
                    />

                    <label className="block">
                      <select
                        name="region"
                        required
                        defaultValue={
                          isRegion
                            ? ""
                            : "Región Metropolitana"
                        }
                        className="h-11 w-full rounded-sm border border-brand-200 bg-white px-3.5 text-sm text-brand-950 outline-none transition focus:border-[#101010] focus:ring-2 focus:ring-[#101010]/10"
                      >
                        <option value="" disabled>
                          Región
                        </option>

                        <option>
                          Región Metropolitana
                        </option>

                        <option>
                          Región de Arica y Parinacota
                        </option>

                        <option>
                          Región de Tarapacá
                        </option>

                        <option>
                          Región de Antofagasta
                        </option>

                        <option>
                          Región de Atacama
                        </option>

                        <option>
                          Región de Coquimbo
                        </option>

                        <option>
                          Región de Valparaíso
                        </option>

                        <option>
                          Región de O&apos;Higgins
                        </option>

                        <option>
                          Región del Maule
                        </option>

                        <option>
                          Región de Ñuble
                        </option>

                        <option>
                          Región del Biobío
                        </option>

                        <option>
                          Región de La Araucanía
                        </option>

                        <option>
                          Región de Los Ríos
                        </option>

                        <option>
                          Región de Los Lagos
                        </option>

                        <option>
                          Región de Aysén
                        </option>

                        <option>
                          Región de Magallanes
                        </option>
                      </select>
                    </label>
                  </div>
                </section>
              )}

              {/* Métodos de pago */}
              <section className="rounded-md border border-[#e8e5df] bg-white p-5">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-neutral-600">
                  Medio de pago
                </h2>

                <div className="mt-4 space-y-2">
                  <PaymentOption
                    id="webpay"
                    label="Webpay"
                    description="Tarjetas de débito y crédito"
                    selected={
                      paymentMethod === "webpay"
                    }
                    onSelect={() =>
                      setPaymentMethod("webpay")
                    }
                    icon={<CreditCard size={18} />}
                  />

                  <PaymentOption
                    id="mercado-pago"
                    label="Mercado Pago"
                    description="Paga con tarjeta o saldo disponible"
                    selected={
                      paymentMethod ===
                      "mercado-pago"
                    }
                    onSelect={() =>
                      setPaymentMethod(
                        "mercado-pago",
                      )
                    }
                    icon={<WalletCards size={18} />}
                  />

                  <PaymentOption
                    id="transferencia"
                    label="Transferencia bancaria"
                    description="Pago directo a la cuenta de The Black Store"
                    selected={
                      paymentMethod ===
                      "transferencia"
                    }
                    onSelect={() =>
                      setPaymentMethod(
                        "transferencia",
                      )
                    }
                    icon={<Landmark size={18} />}
                  />
                </div>
              </section>

              {/* Factura */}
              <section
                className={[
                  "rounded-md border-[1.5px] bg-white px-5 py-4 transition",
                  needsInvoice
                    ? "border-accent-400"
                    : "border-[#e8e5df]",
                ].join(" ")}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={needsInvoice}
                    onChange={(event) =>
                      setNeedsInvoice(
                        event.target.checked,
                      )
                    }
                    className="mt-0.5 size-4 shrink-0 accent-brand-950"
                  />

                  <span>
                    <span className="block text-[13px] font-medium text-brand-950">
                      ¿Necesitas factura?
                    </span>

                    {!needsInvoice && (
                      <span className="mt-0.5 block text-xs text-neutral-500">
                        Solo si requieres documento tributario
                      </span>
                    )}
                  </span>
                </label>

                {needsInvoice && (
                  <div className="mt-4 space-y-3 border-t border-accent-200 pt-4">
                    <FormField
                      name="companyRut"
                      placeholder="RUT empresa, ejemplo: 76.123.456-7"
                      required
                    />

                    <FormField
                      name="businessName"
                      placeholder="Razón social"
                      required
                    />

                    <FormField
                      name="businessActivity"
                      placeholder="Giro comercial"
                      required
                    />
                  </div>
                )}
              </section>

           {validationError && (
  <p
    role="alert"
    className="rounded-md bg-red-50 p-4 text-sm text-red-800"
  >
    {validationError}
  </p>
)}
              <button
                type="submit"
                disabled={validating}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#101010] px-6 py-[13px] text-[15px] font-semibold text-white transition hover:bg-brand-800"
              >
                {validating ? "Procesando pedido…" : "Confirmar pedido"}
                <ChevronRight size={17} />
              </button>
            </form>

            {/* Resumen */}
            <aside className="rounded-md border border-[#e8e5df] bg-white p-[18px] lg:sticky lg:top-24">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-neutral-600">
                Resumen
              </h2>

              <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-start justify-between gap-3 border-b border-brand-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-[1.35] text-brand-950">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-neutral-600">
                        x{item.quantity}

                        {item.subtitle
                          ? ` · ${item.subtitle}`
                          : ""}
                      </p>
                    </div>

                    <p className="shrink-0 text-[13px] font-semibold text-brand-950">
                      {formatCLP(
                        item.price *
                        item.quantity,
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="my-4 h-px bg-brand-200" />

              <div className="space-y-2">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-neutral-600">
                    Subtotal
                  </span>

                  <span className="text-brand-950">
                    {formatCLP(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-neutral-600">
                    Envío
                  </span>

                  <span
                    className={[
                      "text-right",
                      isPickup
                        ? "font-semibold text-emerald-600"
                        : "text-brand-950",
                    ].join(" ")}
                  >
                    {isPickup
                      ? "Gratis"
                      : isRegion
                        ? "A cotizar"
                        : formatCLP(
                          SANTIAGO_SHIPPING_PRICE,
                        )}
                  </span>
                </div>
              </div>

              <div className="my-4 h-px bg-brand-200" />

              <div className="flex items-center justify-between gap-4 text-[17px] font-bold text-brand-950">
                <span>Total</span>

                <span>
                  {isRegion && !isPickup
                    ? "A definir"
                    : formatCLP(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={validating}
                form="checkout-form"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-sm bg-[#101010] px-5 py-[13px] text-[15px] font-semibold text-white transition hover:bg-brand-800 lg:hidden"
              >
               {validating ? "Procesando pedido…" : "Confirmar pedido"}
                <ChevronRight size={17} />
              </button>

              <div className="mt-4 flex items-start gap-2 rounded-md bg-brand-50 p-3">
                {isPickup ? (
                  <Truck
                    size={17}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                ) : (
                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0 text-brand-700"
                  />
                )}

                <p className="text-[11px] leading-5 text-neutral-600">
                  {isPickup
                    ? "Te avisaremos cuando tu pedido esté listo para retirar."
                    : isRegion
                      ? "El costo definitivo del despacho regional será coordinado antes del envío."
                      : "El despacho seleccionado corresponde a Santiago."}
                </p>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-md bg-brand-50 p-3">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-[11px] leading-5 text-neutral-600">
                  Tus datos serán utilizados únicamente para
                  procesar y entregar tu compra.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </main>
  );
}