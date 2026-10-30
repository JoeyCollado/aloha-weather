// lib/auth.ts 
import { auth, clerkClient } from "@clerk/nextjs/server";
import { collection } from "./db";

export class UnauthorizedError extends Error {
  status: number;
  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.status = status;
  }
}

export interface OwnerIdentity {
  clerkUserId: string;
  email: string;
}

export async function requireOwner(): Promise<OwnerIdentity> {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError("Not signed in", 401);

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  // REMOVED THE ROLE CHECK HERE
  // const role = user.publicMetadata?.role;
  // if (role !== "owner") { throw ... }

  const email = user.primaryEmailAddress?.emailAddress ?? "user@aloha-rmr.local";

  // Sync to Mongo (we keep the role tag just for database records)
  const users = await collection("users");
  await users.updateOne(
    { clerkUserId: userId },
    { 
      $set: { email, updatedAt: new Date() }, 
      $setOnInsert: { clerkUserId: userId, role: "user", createdAt: new Date() } 
    },
    { upsert: true }
  );

  return { clerkUserId: userId, email };
}