import { z } from "zod";

/**
 * daily_notes — one note per calendar day (FR-9 in proposal).
 * Weather-vs-sales reads `sales` for the same date at report time.
 *
 * `date` is stored as "YYYY-MM-DD" (string) so:
 *   - the unique index works per calendar day (not per timestamp)
 *   - reports can join to `sales.createdAt` by string prefix
 * `orderCount` is optional because order count is derived from sales;
 * it is kept here only for manual reconciliation.
 */
export interface DailyNote {
  _id?: unknown;
  ownerId: string;
  date: string;             // "YYYY-MM-DD"
  weather: "sunny" | "cloudy" | "rainy" | "stormy" | "other";
  remarks?: string;
  orderCount?: number;      // optional; derived from sales for reports
  createdAt: Date;
  updatedAt: Date;
}

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const DailyNoteCreateSchema = z.object({
  date: dateString,
  weather: z.enum(["sunny", "cloudy", "rainy", "stormy", "other"]),
  remarks: z.string().trim().max(500).optional(),
  orderCount: z.number().int().min(0).optional(),
});

export const DailyNoteUpdateSchema = DailyNoteCreateSchema.partial().omit({ date: true });

export type DailyNoteCreate = z.infer<typeof DailyNoteCreateSchema>;
export type DailyNoteUpdate = z.infer<typeof DailyNoteUpdateSchema>;