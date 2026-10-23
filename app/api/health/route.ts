import { healthCheck } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await healthCheck();
    return Response.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}