import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import { z } from "@medusajs/framework/zod";

import {
  addCustomMattressToCartWorkflow,
} from "../../../../../workflows/add-custom-mattress-to-cart";

const PostCustomMattressSchema = z.object({
  variant_id: z
    .string()
    .min(
      1,
      "La variante del producto es obligatoria.",
    ),

  quantity: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(1),

  length: z
    .number()
    .min(50)
    .max(250),

  width: z
    .number()
    .min(50)
    .max(250),

  thickness: z
    .number()
    .refine(
      (value) =>
        [10, 15, 20].includes(value),
      {
        message:
          "El espesor debe ser de 10, 15 o 20 cm.",
      },
    ),
});

type PostCustomMattressBody = z.infer<
  typeof PostCustomMattressSchema
>;

export async function POST(
  req: MedusaRequest<PostCustomMattressBody>,
  res: MedusaResponse,
) {
  const validation =
    PostCustomMattressSchema.safeParse(
      req.body,
    );

  if (!validation.success) {
    return res.status(400).json({
      message:
        "Los datos del colchón no son válidos.",
      errors:
        validation.error.flatten()
          .fieldErrors,
    });
  }

  const { id: cartId } =
    req.params;

  const {
    variant_id,
    quantity,
    length,
    width,
    thickness,
  } = validation.data;

  const { result } =
    await addCustomMattressToCartWorkflow(
      req.scope,
    ).run({
      input: {
        cart_id: cartId,
        item: {
          variant_id,
          quantity,
          length,
          width,
          thickness,
        },
      },
    });

  return res.status(200).json({
    cart: result.cart,
  });
}
