export type CartItemConfiguration = {
  length?: number;
  width?: number;
  thickness?: number;
  label?: string;
};

export type CartItem = {
  /**
   * Identificador interno del producto.
   * ID del producto en PostgreSQL.
   */
  id: string;

  /**
   * Identificador de la variante.
   */
  variantId?: string;

  /**
   * Identificador único de la línea dentro del carrito.
   *
   * Es importante porque un mismo producto puede agregarse
   * con configuraciones diferentes.
   */
  cartItemId: string;

  name: string;
  image?: string;
  href?: string;

  /**
   * Precio unitario expresado en pesos chilenos.
   */
  price: number;

  quantity: number;
  maxQuantity?: number;

  /**
   * Información visible debajo del nombre.
   *
   * Ejemplos:
   * "2 plazas · 135 × 190 cm"
   * "190 × 105 × 15 cm"
   */
  subtitle?: string;

  /**
   * Configuración especial para productos personalizados.
   */
  configuration?: CartItemConfiguration;

  /**
   * Indica si el producto necesita una cotización
   * especial de despacho hacia regiones.
   */
  dimensioned?: boolean;

  /**
   * Metadata adicional de la línea del carrito.
   */
  metadata?: Record<string, string | number | boolean>;
};

export type DeliveryMethod =
  | "shipping"
  | "pickup";

export type DeliveryZone =
  | "santiago"
  | "region";

export type CartState = {
  items: CartItem[];
  deliveryMethod: DeliveryMethod;
  deliveryZone: DeliveryZone;
};

export type AddCartItemInput = Omit<
  CartItem,
  "cartItemId"
> & {
  cartItemId?: string;
};
