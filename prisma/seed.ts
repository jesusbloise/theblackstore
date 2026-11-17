import {
  ProductStatus,
  ProductType,
} from "../lib/generated/prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Iniciando seed de Incal...");

  /*
   * 1. Categoría principal
   */
  const mattressesCategory =
    await prisma.category.upsert({
      where: {
        slug: "colchones",
      },
      update: {
        name: "Colchones",
        description:
          "Colchones para distintas necesidades de descanso.",
        isActive: true,
        sortOrder: 1,
      },
      create: {
        name: "Colchones",
        slug: "colchones",
        description:
          "Colchones para distintas necesidades de descanso.",
        isActive: true,
        sortOrder: 1,
      },
    });

  /*
   * 2. Subcategorías
   */
  const customMattressesCategory =
    await prisma.category.upsert({
      where: {
        slug: "a-medida",
      },
      update: {
        name: "Colchones a medida",
        description:
          "Colchones fabricados según las dimensiones solicitadas.",
        parentId: mattressesCategory.id,
        isActive: true,
        sortOrder: 1,
      },
      create: {
        name: "Colchones a medida",
        slug: "a-medida",
        description:
          "Colchones fabricados según las dimensiones solicitadas.",
        parentId: mattressesCategory.id,
        isActive: true,
        sortOrder: 1,
      },
    });

  const foamMattressesCategory =
    await prisma.category.upsert({
      where: {
        slug: "espuma",
      },
      update: {
        name: "Colchones de espuma",
        description:
          "Colchones de espuma disponibles en distintas medidas.",
        parentId: mattressesCategory.id,
        isActive: true,
        sortOrder: 2,
      },
      create: {
        name: "Colchones de espuma",
        slug: "espuma",
        description:
          "Colchones de espuma disponibles en distintas medidas.",
        parentId: mattressesCategory.id,
        isActive: true,
        sortOrder: 2,
      },
    });

  await prisma.category.upsert({
    where: {
      slug: "espuma-premium",
    },
    update: {
      name: "Colchones de espuma premium",
      description:
        "Colchones de espuma de línea premium.",
      parentId: mattressesCategory.id,
      isActive: true,
      sortOrder: 3,
    },
    create: {
      name: "Colchones de espuma premium",
      slug: "espuma-premium",
      description:
        "Colchones de espuma de línea premium.",
      parentId: mattressesCategory.id,
      isActive: true,
      sortOrder: 3,
    },
  });

  await prisma.category.upsert({
    where: {
      slug: "resortes",
    },
    update: {
      name: "Colchones de resortes",
      description:
        "Colchones fabricados con distintos sistemas de resortes.",
      parentId: mattressesCategory.id,
      isActive: true,
      sortOrder: 4,
    },
    create: {
      name: "Colchones de resortes",
      slug: "resortes",
      description:
        "Colchones fabricados con distintos sistemas de resortes.",
      parentId: mattressesCategory.id,
      isActive: true,
      sortOrder: 4,
    },
  });

  /*
   * 3. Producto personalizado:
   * Colchón acolchado a medida
   */
  const customMattress =
    await prisma.product.upsert({
      where: {
        slug: "colchon-a-medida",
      },
      update: {
        name: "Colchón acolchado a medida",
        shortDescription:
          "Colchón personalizado fabricado según las dimensiones requeridas.",
        description:
          "Colchón acolchado fabricado a medida con espuma D21 y tela Jacquard acolchada.",
        status: ProductStatus.PUBLISHED,
        type: ProductType.CUSTOM_MATTRESS,
        brand: "Incal",
        manufacturingDays: 12,
      },
      create: {
        name: "Colchón acolchado a medida",
        slug: "colchon-a-medida",
        shortDescription:
          "Colchón personalizado fabricado según las dimensiones requeridas.",
        description:
          "Colchón acolchado fabricado a medida con espuma D21 y tela Jacquard acolchada.",
        status: ProductStatus.PUBLISHED,
        type: ProductType.CUSTOM_MATTRESS,
        brand: "Incal",
        manufacturingDays: 12,
      },
    });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: customMattress.id,
        categoryId:
          customMattressesCategory.id,
      },
    },
    update: {},
    create: {
      productId: customMattress.id,
      categoryId:
        customMattressesCategory.id,
    },
  });

  await prisma.customMattressConfig.upsert({
    where: {
      productId: customMattress.id,
    },
    update: {
      density: "D21",
      minimumLengthCm: 50,
      maximumLengthCm: 250,
      minimumWidthCm: 50,
      maximumWidthCm: 250,
      allowedThicknessCm: [10, 15, 20],
      basePricePerSquareM: 72000,
    },
    create: {
      productId: customMattress.id,
      density: "D21",
      minimumLengthCm: 50,
      maximumLengthCm: 250,
      minimumWidthCm: 50,
      maximumWidthCm: 250,
      allowedThicknessCm: [10, 15, 20],
      basePricePerSquareM: 72000,
    },
  });

  await prisma.productFeature.deleteMany({
    where: {
      productId: customMattress.id,
    },
  });

  await prisma.productFeature.createMany({
    data: [
      {
        productId: customMattress.id,
        text: "Fabricación personalizada",
        sortOrder: 1,
      },
      {
        productId: customMattress.id,
        text: "Espuma de densidad D21",
        sortOrder: 2,
      },
      {
        productId: customMattress.id,
        text: "Tela Jacquard acolchada",
        sortOrder: 3,
      },
      {
        productId: customMattress.id,
        text: "Ideal para camas y espacios especiales",
        sortOrder: 4,
      },
    ],
  });

  await prisma.productSpecification.deleteMany({
    where: {
      productId: customMattress.id,
    },
  });

  await prisma.productSpecification.createMany({
    data: [
      {
        productId: customMattress.id,
        label: "Estructura",
        value: "Espuma",
        sortOrder: 1,
      },
      {
        productId: customMattress.id,
        label: "Relleno",
        value: "Espuma D21",
        sortOrder: 2,
      },
      {
        productId: customMattress.id,
        label: "Tapiz",
        value: "Tela Jacquard acolchada",
        sortOrder: 3,
      },
      {
        productId: customMattress.id,
        label: "Fabricación",
        value: "12 días hábiles",
        sortOrder: 4,
      },
    ],
  });

  /*
   * 4. Producto estándar:
   * Colchón espuma acolchado
   */
  const foamMattress =
    await prisma.product.upsert({
      where: {
        slug: "colchon-espuma-acolchado",
      },
      update: {
        name: "Colchón espuma acolchado",
        shortDescription:
          "Colchón de espuma acolchado disponible en las medidas utilizadas por Incal.",
        description:
          "Colchón de espuma acolchado diseñado para entregar comodidad y soporte durante el descanso.",
        status: ProductStatus.PUBLISHED,
        type: ProductType.STANDARD,
        brand: "Incal",
      },
      create: {
        name: "Colchón espuma acolchado",
        slug: "colchon-espuma-acolchado",
        shortDescription:
          "Colchón de espuma acolchado disponible en las medidas utilizadas por Incal.",
        description:
          "Colchón de espuma acolchado diseñado para entregar comodidad y soporte durante el descanso.",
        status: ProductStatus.PUBLISHED,
        type: ProductType.STANDARD,
        brand: "Incal",
      },
    });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: foamMattress.id,
        categoryId:
          foamMattressesCategory.id,
      },
    },
    update: {},
    create: {
      productId: foamMattress.id,
      categoryId:
        foamMattressesCategory.id,
    },
  });

  /*
   * Precios provisionales.
   * Se reemplazarán cuando Incal entregue
   * la tabla oficial.
   */
  const foamVariants = [
    {
      name: "1 Plaza",
      sku: "CEA-1P",
      price: 92490,
      stock: 10,
      measure: "1 Plaza",
      sortOrder: 1,
    },
    {
      name: "1,5 Plaza",
      sku: "CEA-15P",
      price: 112490,
      stock: 10,
      measure: "1,5 Plaza",
      sortOrder: 2,
    },
    {
      name: "2 Plazas",
      sku: "CEA-2P",
      price: 132490,
      stock: 10,
      measure: "2 Plazas",
      sortOrder: 3,
    },
  ];

  for (const variantData of foamVariants) {
    const variant =
      await prisma.productVariant.upsert({
        where: {
          sku: variantData.sku,
        },
        update: {
          productId: foamMattress.id,
          name: variantData.name,
          price: variantData.price,
          stock: variantData.stock,
          manageInventory: true,
          allowBackorder: false,
          isActive: true,
          sortOrder:
            variantData.sortOrder,
        },
        create: {
          productId: foamMattress.id,
          name: variantData.name,
          sku: variantData.sku,
          price: variantData.price,
          stock: variantData.stock,
          manageInventory: true,
          allowBackorder: false,
          isActive: true,
          sortOrder:
            variantData.sortOrder,
        },
      });

    await prisma.variantAttribute.upsert({
      where: {
        variantId_name: {
          variantId: variant.id,
          name: "Medida",
        },
      },
      update: {
        value: variantData.measure,
        sortOrder: 1,
      },
      create: {
        variantId: variant.id,
        name: "Medida",
        value: variantData.measure,
        sortOrder: 1,
      },
    });
  }

  console.log("Seed de Incal completado.");
  console.log({
    categories: 5,
    products: 2,
    foamVariants:
      foamVariants.length,
  });
}

main()
  .catch((error) => {
    console.error(
      "Error ejecutando el seed:",
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });