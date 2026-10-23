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

  // 1. Fetch the user directly from Clerk's API (bypasses stale local cache)
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  // 2. Check the metadata directly from the database, not the token
  const role = user.publicMetadata?.role;

  if (role !== "owner") {
    throw new UnauthorizedError("This account does not have owner access", 403);
  }

  const email = user.primaryEmailAddress?.emailAddress ?? "owner@aloha-rmr.local";

  // 3. Sync to Mongo
  const users = await collection("users");
  await users.updateOne(
    { clerkUserId: userId },
    { 
      $set: { email, role: "owner", updatedAt: new Date() }, 
      $setOnInsert: { clerkUserId: userId, createdAt: new Date() } 
    },
    { upsert: true }
  );

  return { clerkUserId: userId, email };
}

export async function withOwner<T>(handler: (owner: OwnerIdentity) => Promise<T>): Promise<T | Response> {
  try {
    const owner = await requireOwner();
    return await handler(owner);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}