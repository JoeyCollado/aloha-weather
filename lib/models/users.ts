import { z } from "zod";

/**
 * users
 * Mirrors Clerk identity into Mongo so we can scope every other
 * collection by `ownerId`. One document per Clerk user.
 */
export interface User {
  _id?: unknown;
  clerkUserId: string;   // Clerk's user_xxx — unique
  email: string;
  role: "owner";         // only role in this system
  createdAt: Date;
  updatedAt: Date;
}

export const UserCreateSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email(),
  role: z.literal("owner").default("owner"),
});

export const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  role: z.literal("owner").optional(),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;