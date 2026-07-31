import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import {
  acquireLockStep,
  addToCartWorkflow,
  releaseLockStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows";

type CustomMattressMetadata = {
  length: number;
  width: number;
  thickness: number;
  density: string;
  custom_product: true;
  configuration_label: string;
};

type CalculateCustomMattressPriceInput = {
  length: number;
  width: number;
  thickness: number;
};

type AddCustomMattressToCartWorkflowInput = {
  cart_id: string;
  item: {
    variant_id: string;
    quantity: number;
    length: number;
    width: number;
    thickness: number;
  };
};

const ALLOWED_THICKNESSES = [10, 15, 20];

const calculateCustomMattressPriceStep = createStep(
  "calculate-custom-mattress-price",
  async ({
    length,
    width,
    thickness,
  }: CalculateCustomMattressPriceInput) => {
    if (
      !Number.isFinite(length) ||
      !Number.isFinite(width) ||
      !Number.isFinite(thickness)
    ) {
      throw new Error(
        "Las medidas y el espesor deben ser números válidos.",
      );
    }

    if (
      length < 50 ||
      length > 250 ||
      width < 50 ||
      width > 250
    ) {
      throw new Error(
        "El largo y el ancho deben estar entre 50 y 250 cm.",
      );
    }

    if (!ALLOWED_THICKNESSES.includes(thickness)) {
      throw new Error(
        "El espesor debe ser de 10, 15 o 20 cm.",
      );
    }

    const areaFactor =
      (length * width) / 10000;

    const thicknessFactor =
      thickness / 10;

    /*
     * Esta es la misma fórmula provisional que utiliza
     * actualmente el configurador del frontend.
     *
     * Cuando Incal entregue su tabla definitiva,
     * esta será la única fórmula que habrá que reemplazar.
     */
    const calculatedPrice =
      72000 *
      areaFactor *
      thicknessFactor;

    const price =
      Math.round(calculatedPrice / 1000) *
      1000;

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      throw new Error(
        "No fue posible calcular un precio válido para el colchón.",
      );
    }

    return new StepResponse(price);
  },
);

export const addCustomMattressToCartWorkflow =
  createWorkflow(
    "add-custom-mattress-to-cart",
    (
      input: AddCustomMattressToCartWorkflowInput,
    ) => {
      /*
       * Verifica que el carrito exista antes de modificarlo.
       */
      useQueryGraphStep({
        entity: "cart",
        fields: ["id"],
        filters: {
          id: input.cart_id,
        },
        options: {
          throwIfKeyNotFound: true,
        },
      });

      const price =
        calculateCustomMattressPriceStep({
          length: input.item.length,
          width: input.item.width,
          thickness: input.item.thickness,
        });

      acquireLockStep({
        key: input.cart_id,
        timeout: 2,
        ttl: 10,
      });

      const itemData = transform(
        {
          item: input.item,
          price,
        },
        (data) => {
          const metadata: CustomMattressMetadata = {
            length: data.item.length,
            width: data.item.width,
            thickness:
              data.item.thickness,
            density: "D21",
            custom_product: true,
            configuration_label:
              `${data.item.length} × ${data.item.width} × ${data.item.thickness} cm`,
          };

          return {
            variant_id:
              data.item.variant_id,
            quantity:
              data.item.quantity,
            unit_price:
              data.price,
            metadata,
          };
        },
      );

      addToCartWorkflow.runAsStep({
        input: {
          cart_id: input.cart_id,
          items: [itemData],
        },
      });

      const { data: updatedCarts } =
        useQueryGraphStep({
          entity: "cart",
          fields: [
            "*",
            "items.*",
            "items.variant.*",
            "items.variant.product.*",
          ],
          filters: {
            id: input.cart_id,
          },
        }).config({
          name: "refetch-custom-mattress-cart",
        });

      releaseLockStep({
        key: input.cart_id,
      });

      return new WorkflowResponse({
        cart: updatedCarts[0],
      });
    },
  );