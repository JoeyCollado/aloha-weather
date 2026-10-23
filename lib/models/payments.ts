import { z } from "zod";

/**
 * payments — one payment record per sale (FR-6).
 * Card/e-wallet handled by Stripe; we store only the reference + amount.
 * No card data is ever stored (proposal §IV.C).
 */
export interface Payment {
  _id?: unknown;
  ownerId: string;
  saleId: string;
  method: "cash" | "card" | "ewallet";
  amount: number;
  providerReference?: string;  // Stripe PaymentIntent ID, if applicable
  status: "pending" | "succeeded" | "failed";
  idempotencyKey: string;      // prevents double-charging on retry
  createdAt: Date;
  updatedAt: Date;
}

export const PaymentCreateSchema = z.object({
  saleId: z.string().min(1),
  method: z.enum(["cash", "card", "ewallet"]),
  amount: z.number().finite().min(0),
  providerReference: z.string().min(1).optional(),
  status: z.enum(["pending", "succeeded", "failed"]).default("pending"),
  idempotencyKey: z.string().min(1),
});

export const PaymentUpdateSchema = z.object({
  status: z.enum(["pending", "succeeded", "failed"]).optional(),
  providerReference: z.string().min(1).optional(),
});

export type PaymentCreate = z.infer<typeof PaymentCreateSchema>;
export type PaymentUpdate = z.infer<typeof PaymentUpdateSchema>;