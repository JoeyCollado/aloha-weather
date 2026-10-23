import { z } from "zod";

/**
 * items — inventory ingredients / packaging / supplies.
 * `quantity` and `unitCost` are non-negative (proposal FR-2).
 * Low stock = quantity <= reorderLevel (proposal FR-10).
 */
export interface Item {
  _id?: unknown;
  ownerId: string;          // Clerk user id — every query scoped by this
  name: string;
  category: string;
  unit: string;             // e.g. "kg", "pcs", "L"
  quantity: number;         // >= 0
  reorderLevel: number;     // >= 0
  unitCost: number;         // >= 0
  createdAt: Date;
  updatedAt: Date;
}

const nonNegative = z.number().finite().min(0, "Must be zero or greater");

export const ItemCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  unit: z.string().trim().min(1).max(20),
  quantity: nonNegative,
  reorderLevel: nonNegative,
  unitCost: nonNegative,
});

export const ItemUpdateSchema = ItemCreateSchema.partial();

export type ItemCreate = z.infer<typeof ItemCreateSchema>;
export type ItemUpdate = z.infer<typeof ItemUpdateSchema>;