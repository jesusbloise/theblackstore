"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  AddCartItemInput,
  CartItem,
  DeliveryMethod,
  DeliveryZone,
} from "@/lib/types/cart";

const CART_STORAGE_KEY = "theblackstore-cart-v1";

type StoredCart = {
  items: CartItem[];
  deliveryMethod: DeliveryMethod;
  deliveryZone: DeliveryZone;
};

type CartContextValue = {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  items: CartItem[];
  deliveryMethod: DeliveryMethod;
  deliveryZone: DeliveryZone;

  itemCount: number;
  subtotal: number;
  hasDimensionedProducts: boolean;
  isHydrated: boolean;

  addItem: (
    item: AddCartItemInput,
  ) => void;

  removeItem: (
    cartItemId: string,
  ) => void;

  increaseQuantity: (
    cartItemId: string,
  ) => void;

  decreaseQuantity: (
    cartItemId: string,
  ) => void;

  updateQuantity: (
    cartItemId: string,
    quantity: number,
  ) => void;

  clearCart: () => void;

  setDeliveryMethod: (
    method: DeliveryMethod,
  ) => void;

  setDeliveryZone: (
    zone: DeliveryZone,
  ) => void;
};

const CartContext =
  createContext<CartContextValue | null>(
    null,
  );

function createCartItemId(
  item: AddCartItemInput,
) {
  if (item.cartItemId) {
    return item.cartItemId;
  }

  const configurationParts = [
    item.configuration?.length,
    item.configuration?.width,
    item.configuration?.thickness,
  ].filter(
    (value): value is number =>
      typeof value === "number",
  );

  const baseId =
    item.variantId ?? item.id;

  if (configurationParts.length > 0) {
    return [
      baseId,
      ...configurationParts,
    ].join("-");
  }

  return baseId;
}

function isDeliveryMethod(
  value: unknown,
): value is DeliveryMethod {
  return (
    value === "shipping" ||
    value === "pickup"
  );
}

function isDeliveryZone(
  value: unknown,
): value is DeliveryZone {
  return (
    value === "santiago" ||
    value === "region"
  );
}

function readStoredCart(): StoredCart | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        CART_STORAGE_KEY,
      );

    if (!storedValue) {
      return null;
    }

    const parsedValue =
      JSON.parse(storedValue) as Partial<StoredCart>;

    return {
      items: Array.isArray(parsedValue.items)
        ? parsedValue.items
        : [],
      deliveryMethod:
        isDeliveryMethod(
          parsedValue.deliveryMethod,
        )
          ? parsedValue.deliveryMethod
          : "shipping",
      deliveryZone:
        isDeliveryZone(
          parsedValue.deliveryZone,
        )
          ? parsedValue.deliveryZone
          : "santiago",
    };
  } catch (error) {
    console.error(
      "No se pudo leer el carrito guardado:",
      error,
    );

    return null;
  }
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isCartOpen, setCartOpen] = useState(false);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const [items, setItems] = useState<
    CartItem[]
  >([]);

  const [
    deliveryMethod,
    setDeliveryMethod,
  ] = useState<DeliveryMethod>(
    "shipping",
  );

  const [
    deliveryZone,
    setDeliveryZone,
  ] = useState<DeliveryZone>(
    "santiago",
  );

  const [isHydrated, setIsHydrated] =
    useState(false);

  useEffect(() => {
    const storedCart = readStoredCart();

    if (storedCart) {
      setItems(storedCart.items);
      setDeliveryMethod(
        storedCart.deliveryMethod,
      );
      setDeliveryZone(
        storedCart.deliveryZone,
      );
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const cartToStore: StoredCart = {
      items,
      deliveryMethod,
      deliveryZone,
    };

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartToStore),
      );
    } catch (error) {
      console.error(
        "No se pudo guardar el carrito:",
        error,
      );
    }
  }, [
    items,
    deliveryMethod,
    deliveryZone,
    isHydrated,
  ]);

  const addItem = useCallback(
    (input: AddCartItemInput) => {
      const cartItemId =
        createCartItemId(input);

      const quantity = Math.max(
        1,
        Math.floor(input.quantity || 1),
      );

      setItems((currentItems) => {
        const existingItem =
          currentItems.find(
            (item) =>
              item.cartItemId ===
              cartItemId,
          );

        if (existingItem) {
          return currentItems.map(
            (item) =>
              item.cartItemId ===
              cartItemId
                ? {
                    ...item,
                    maxQuantity: input.maxQuantity,
                    quantity:
                      Math.min(input.maxQuantity ?? 100, item.quantity + quantity),
                  }
                : item,
          );
        }

        const newItem: CartItem = {
          ...input,
          cartItemId,
          quantity: Math.min(input.maxQuantity ?? 100, quantity),
        };

        return [
          ...currentItems,
          newItem,
        ];
      });
      openCart();
    },
    [openCart],
  );

  const removeItem = useCallback(
    (cartItemId: string) => {
      setItems((currentItems) =>
        currentItems.filter(
          (item) =>
            item.cartItemId !==
            cartItemId,
        ),
      );
    },
    [],
  );

  const increaseQuantity =
    useCallback(
      (cartItemId: string) => {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.cartItemId ===
            cartItemId
              ? {
                  ...item,
                  quantity:
                    Math.min(item.maxQuantity ?? 100, item.quantity + 1),
                }
              : item,
          ),
        );
      },
      [],
    );

  const decreaseQuantity =
    useCallback(
      (cartItemId: string) => {
        setItems((currentItems) =>
          currentItems
            .map((item) =>
              item.cartItemId ===
              cartItemId
                ? {
                    ...item,
                    quantity:
                      item.quantity - 1,
                  }
                : item,
            )
            .filter(
              (item) =>
                item.quantity > 0,
            ),
        );
      },
      [],
    );

  const updateQuantity =
    useCallback(
      (
        cartItemId: string,
        quantity: number,
      ) => {
        const normalizedQuantity =
          Math.floor(quantity);

        if (normalizedQuantity <= 0) {
          setItems((currentItems) =>
            currentItems.filter(
              (item) =>
                item.cartItemId !==
                cartItemId,
            ),
          );

          return;
        }

        setItems((currentItems) =>
          currentItems.map((item) =>
            item.cartItemId ===
            cartItemId
              ? {
                  ...item,
                  quantity:
                    Math.min(item.maxQuantity ?? 100, normalizedQuantity),
                }
              : item,
          ),
        );
      },
      [],
    );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity,
        0,
      ),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          item.price * item.quantity,
        0,
      ),
    [items],
  );

  const hasDimensionedProducts =
    useMemo(
      () =>
        items.some(
          (item) =>
            item.dimensioned === true,
        ),
      [items],
    );

  const value =
    useMemo<CartContextValue>(
      () => ({
        isCartOpen, openCart, closeCart,
        items,
        deliveryMethod,
        deliveryZone,
        itemCount,
        subtotal,
        hasDimensionedProducts,
        isHydrated,
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        setDeliveryMethod,
        setDeliveryZone,
      }),
      [
        isCartOpen, openCart, closeCart,
        items,
        deliveryMethod,
        deliveryZone,
        itemCount,
        subtotal,
        hasDimensionedProducts,
        isHydrated,
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
      ],
    );

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart debe utilizarse dentro de CartProvider.",
    );
  }

  return context;
}