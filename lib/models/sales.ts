import { z } from "zod";

/**
 * sales — header record for one POS transaction (FR-5).
 * Totals are recomputed server-side; never trust client totals.
 */
export interface Sale {
  _id?: unknown;
  ownerId: string;
  saleNumber: string;      // human-readable, unique per owner
  subtotal: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "void";
  createdAt: Date;
  updatedAt: Date;
}

export const SaleCreateSchema = z.object({
  subtotal: z.number().finite().min(0),
  tax: z.number().finite().min(0).default(0),
  total: z.number().finite().min(0),
});

export const SaleUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "void"]).optional(),
});

export type SaleCreate = z.infer<typeof SaleCreateSchema>;
export type SaleUpdate = z.infer<typeof SaleUpdateSchema>;