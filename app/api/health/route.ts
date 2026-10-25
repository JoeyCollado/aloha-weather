import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    // Ping the database to make sure it's alive
    await db.command({ ping: 1 });
    
    return Response.json({ ok: true, db: db.databaseName });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}