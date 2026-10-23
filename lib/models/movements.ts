import { z } from "zod";

/**
 * movements — stock-in, stock-out, and adjustments (FR-4).
 *  - "in"         : add quantity
 *  - "out"        : subtract quantity (must not go negative)
 *  - "adjustment" : set quantity to exact count
 * A `sale` also creates "out" movements tied to the sale (auto-deduction).
 */
export interface Movement {
  _id?: unknown;
  ownerId: string;
  itemId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  note?: string;
  saleId?: string;          // set when movement was auto-created by a sale
  createdAt: Date;
}

export const MovementCreateSchema = z.object({
  itemId: z.string().min(1),
  type: z.enum(["in", "out", "adjustment"]),
  quantity: z.number().finite().min(0),
  note: z.string().trim().max(500).optional(),
  saleId: z.string().min(1).optional(),
});

export const MovementUpdateSchema = z.object({
  note: z.string().trim().max(500).optional(),
});

export type MovementCreate = z.infer<typeof MovementCreateSchema>;
export type MovementUpdate = z.infer<typeof MovementUpdateSchema>;