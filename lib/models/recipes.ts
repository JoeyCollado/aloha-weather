import { z } from "zod";

/**
 * recipes — links a product to the items it consumes per sale.
 * A sale of 1 product deducts `quantityRequired` from `itemId` (FR-7).
 * Multiple recipe lines may exist per product (e.g. 1 pizza = dough + cheese).
 */
export interface Recipe {
  _id?: unknown;
  ownerId: string;
  productId: string;        // references products._id (string form)
  itemId: string;           // references items._id
  quantityRequired: number; // > 0 per one product sold
  createdAt: Date;
  updatedAt: Date;
}

export const RecipeCreateSchema = z.object({
  productId: z.string().min(1),
  itemId: z.string().min(1),
  quantityRequired: z.number().finite().positive("Must be greater than zero"),
});

export const RecipeUpdateSchema = z.object({
  quantityRequired: z.number().finite().positive().optional(),
});

export type RecipeCreate = z.infer<typeof RecipeCreateSchema>;
export type RecipeUpdate = z.infer<typeof RecipeUpdateSchema>;