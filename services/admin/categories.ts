import { prisma } from "@/lib/prisma";

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      parent: true,
      children: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}