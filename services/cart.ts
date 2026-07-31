import type { HttpTypes } from "@medusajs/types";

import { sdk } from "@/lib/medusa";

const MEDUSA_CART_STORAGE_KEY = "incal_medusa_cart_id";

function canUseLocalStorage() {
  return typeof window !== "undefined";
}

export function getStoredMedusaCartId(): string | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  return localStorage.getItem(MEDUSA_CART_STORAGE_KEY);
}

export function storeMedusaCartId(cartId: string) {
  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.setItem(MEDUSA_CART_STORAGE_KEY, cartId);
}

export function removeStoredMedusaCartId() {
  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.removeItem(MEDUSA_CART_STORAGE_KEY);
}

export async function createMedusaCart(
  regionId: string,
): Promise<HttpTypes.StoreCart> {
  if (!regionId) {
    throw new Error(
      "No se puede crear el carrito de Medusa sin un regionId.",
    );
  }

  const { cart } = await sdk.store.cart.create({
    region_id: regionId,
  });

  storeMedusaCartId(cart.id);

  return cart;
}

export async function retrieveMedusaCart(
  cartId: string,
): Promise<HttpTypes.StoreCart> {
  if (!cartId) {
    throw new Error(
      "No se puede recuperar el carrito sin un cartId.",
    );
  }

  const { cart } = await sdk.store.cart.retrieve(cartId, {
    fields:
      "+items.*,+items.variant.*,+items.variant.product.*,+shipping_methods.*,+region.*",
  });

  return cart;
}

export async function loadStoredMedusaCart(): Promise<
  HttpTypes.StoreCart | null
> {
  const cartId = getStoredMedusaCartId();

  if (!cartId) {
    return null;
  }

  try {
    return await retrieveMedusaCart(cartId);
  } catch (error) {
    console.error(
      "No fue posible recuperar el carrito guardado de Medusa:",
      error,
    );

    removeStoredMedusaCartId();

    return null;
  }
}

type CreateMedusaLineItemInput = {
  cartId: string;
  variantId: string;
  quantity?: number;
};

export async function createMedusaLineItem({
  cartId,
  variantId,
  quantity = 1,
}: CreateMedusaLineItemInput): Promise<HttpTypes.StoreCart> {
  if (!cartId) {
    throw new Error(
      "No se puede agregar un producto sin un cartId.",
    );
  }

  if (!variantId) {
    throw new Error(
      "No se puede agregar un producto sin un variantId.",
    );
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(
      "La cantidad del producto debe ser un entero mayor que cero.",
    );
  }

  const { cart } =
    await sdk.store.cart.createLineItem(cartId, {
      variant_id: variantId,
      quantity,
    });

  return cart;
}

type UpdateMedusaLineItemInput = {
  cartId: string;
  lineItemId: string;
  quantity: number;
};

export async function updateMedusaLineItem({
  cartId,
  lineItemId,
  quantity,
}: UpdateMedusaLineItemInput): Promise<HttpTypes.StoreCart> {
  if (!cartId) {
    throw new Error(
      "No se puede actualizar un producto sin un cartId.",
    );
  }

  if (!lineItemId) {
    throw new Error(
      "No se puede actualizar un producto sin un lineItemId.",
    );
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(
      "La cantidad debe ser un entero mayor que cero.",
    );
  }

  const { cart } =
    await sdk.store.cart.updateLineItem(
      cartId,
      lineItemId,
      {
        quantity,
      },
    );

  return cart;
}

type DeleteMedusaLineItemInput = {
  cartId: string;
  lineItemId: string;
};

export async function deleteMedusaLineItem({
  cartId,
  lineItemId,
}: DeleteMedusaLineItemInput): Promise<HttpTypes.StoreCart> {
  if (!cartId) {
    throw new Error(
      "No se puede eliminar un producto sin un cartId.",
    );
  }

  if (!lineItemId) {
    throw new Error(
      "No se puede eliminar un producto sin un lineItemId.",
    );
  }

  await sdk.store.cart.deleteLineItem(
    cartId,
    lineItemId,
  );

  return retrieveMedusaCart(cartId);
}
type CreateCustomMattressLineItemInput = {
  cartId: string;
  variantId: string;
  quantity?: number;
  length: number;
  width: number;
  thickness: number;
};

type CreateCustomMattressLineItemResponse = {
  cart: HttpTypes.StoreCart;
};

export async function createCustomMattressLineItem({
  cartId,
  variantId,
  quantity = 1,
  length,
  width,
  thickness,
}: CreateCustomMattressLineItemInput): Promise<HttpTypes.StoreCart> {
  if (!cartId) {
    throw new Error(
      "No se puede agregar el colchón sin un cartId.",
    );
  }

  if (!variantId) {
    throw new Error(
      "No se puede agregar el colchón sin un variantId.",
    );
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 10
  ) {
    throw new Error(
      "La cantidad debe ser un entero entre 1 y 10.",
    );
  }

  if (
    !Number.isFinite(length) ||
    !Number.isFinite(width) ||
    length < 50 ||
    length > 250 ||
    width < 50 ||
    width > 250
  ) {
    throw new Error(
      "El largo y el ancho deben estar entre 50 y 250 cm.",
    );
  }

  if (![10, 15, 20].includes(thickness)) {
    throw new Error(
      "El espesor debe ser de 10, 15 o 20 cm.",
    );
  }

  const response =
    await sdk.client.fetch<CreateCustomMattressLineItemResponse>(
      `/store/carts/${cartId}/custom-mattress`,
      {
        method: "POST",
        body: {
          variant_id: variantId,
          quantity,
          length,
          width,
          thickness,
        },
      },
    );

  return response.cart;
}
export async function getChileRegionId(): Promise<string> {
  const { regions } =
    await sdk.store.region.list();

  const chileRegion = regions.find(
    (region) =>
      region.currency_code?.toLowerCase() ===
      "clp",
  );

  if (!chileRegion) {
    throw new Error(
      "No se encontró la región Chile en Medusa.",
    );
  }

  return chileRegion.id;
}

export async function getOrCreateMedusaCart(): Promise<
  HttpTypes.StoreCart
> {
  const storedCart =
    await loadStoredMedusaCart();

  if (storedCart) {
    return storedCart;
  }

  const chileRegionId =
    await getChileRegionId();

  return createMedusaCart(chileRegionId);
}