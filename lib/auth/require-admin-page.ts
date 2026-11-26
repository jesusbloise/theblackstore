import "server-only";

import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/admin-session";

import {
  hasAdminPermission,
  type AdminPermission,
} from "@/lib/auth/admin-permissions";

export async function requireAdminPage(
  permission: AdminPermission,
) {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  if (!hasAdminPermission(admin.role, permission)) {
    redirect("/admin");
  }

  return admin;
}