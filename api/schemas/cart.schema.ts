import { z } from 'zod';

const CartProductSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export const CartSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  date: z.string(),
  products: z.array(CartProductSchema),
});

export const CartListSchema = z.array(CartSchema);

export type Cart = z.infer<typeof CartSchema>;
