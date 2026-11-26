import "server-only";

export type AdminRole =
  | "SUPER_ADMIN"
  | "ADMIN";

export const ADMIN_PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",

  PRODUCTS_VIEW: "products:view",
  PRODUCTS_MANAGE: "products:manage",
  PRODUCTS_DELETE: "products:delete",

  INVENTORY_MANAGE: "inventory:manage",

  CATEGORIES_MANAGE: "categories:manage",
  BANNERS_MANAGE: "banners:manage",

  ORDERS_VIEW: "orders:view",
  ORDERS_MANAGE: "orders:manage",

  CUSTOMERS_VIEW: "customers:view",

  MEDIA_MANAGE: "media:manage",

  ADMINS_MANAGE: "admins:manage",

  SETTINGS_MANAGE: "settings:manage",
  PAYMENTS_MANAGE: "payments:manage",
  SHIPPING_MANAGE: "shipping:manage",
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

const ROLE_PERMISSIONS: Record<
  AdminRole,
  ReadonlySet<AdminPermission>
> = {
  SUPER_ADMIN: new Set<AdminPermission>(
    Object.values(ADMIN_PERMISSIONS),
  ),

  ADMIN: new Set<AdminPermission>([
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,

    ADMIN_PERMISSIONS.PRODUCTS_VIEW,
    ADMIN_PERMISSIONS.PRODUCTS_MANAGE,

    ADMIN_PERMISSIONS.INVENTORY_MANAGE,

    ADMIN_PERMISSIONS.CATEGORIES_MANAGE,
    ADMIN_PERMISSIONS.BANNERS_MANAGE,

    ADMIN_PERMISSIONS.ORDERS_VIEW,
    ADMIN_PERMISSIONS.ORDERS_MANAGE,

    ADMIN_PERMISSIONS.CUSTOMERS_VIEW,

    ADMIN_PERMISSIONS.MEDIA_MANAGE,
  ]),
};

export function hasAdminPermission(
  role: AdminRole,
  permission: AdminPermission,
): boolean {
  return (
    ROLE_PERMISSIONS[role]?.has(permission) ??
    false
  );
}