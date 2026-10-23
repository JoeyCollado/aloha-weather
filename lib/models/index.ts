// lib/models/index.ts

export * from "./users";
export * from "./items";
export * from "./products";
export * from "./recipes";
export * from "./movements";
export * from "./sales";
export * from "./sale_items";
export * from "./payments";
export * from "./daily_notes";

export const COLLECTIONS = {
  users: "users",
  items: "items",
  products: "products",
  recipes: "recipes",
  movements: "movements",
  sales: "sales",
  saleItems: "sale_items",
  payments: "payments",
  dailyNotes: "daily_notes",
} as const;

/** Keys of COLLECTIONS — pass these to collection(). */
export type CollectionKey = keyof typeof COLLECTIONS;

/** Values of COLLECTIONS — the actual Mongo collection names. */
export type CollectionName = (typeof COLLECTIONS)[CollectionKey];