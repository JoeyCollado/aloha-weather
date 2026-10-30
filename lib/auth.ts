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

  // Fetch the user directly from Clerk's API
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  // REMOVED THE ROLE BLOCK HERE so any logged-in user can access.
  // If you want to enforce the owner role for your defense, uncomment the next 3 lines:
  // const role = user.publicMetadata?.role;
  // if (role !== "owner") throw new UnauthorizedError("This account does not have owner access", 403);

  const email = user.primaryEmailAddress?.emailAddress ?? "user@aloha-rmr.local";

  // Sync to Mongo
  const users = await collection("users");
  await users.updateOne(
    { clerkUserId: userId },
    { 
      $set: { email, updatedAt: new Date() }, 
      $setOnInsert: { clerkUserId: userId, role: "owner", createdAt: new Date() } 
    },
    { upsert: true }
  );

  return { clerkUserId: userId, email };
}

// Restored withOwner function for your API routes
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