import { z } from "zod";

/**
 * products — menu items sold at the POS.
 * `active` controls whether the product is offered at checkout (FR-3).
 */
export interface Product {
  _id?: unknown;
  ownerId: string;
  name: string;
  category: string;
  price: number;        // >= 0
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const price = z.number().finite().min(0, "Price must be zero or greater");

export const ProductCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  price,
  active: z.boolean().default(true),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export type ProductCreate = z.infer<typeof ProductCreateSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;