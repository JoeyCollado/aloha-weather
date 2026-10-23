import { ZodError, ZodSchema } from "zod";

/**
 * Validate an unknown JSON payload against a Zod schema.
 * Throws a 400 Response on failure so API routes can `try/catch`.
 */
export async function parseJson<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    return schema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) {
      const fields = err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      throw Response.json(
        { error: "Validation failed", fields },
        { status: 400 }
      );
    }
    throw err;
  }
}

/** Convert a Date to "YYYY-MM-DD" in local (server) time. */
export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse "YYYY-MM-DD" into a UTC Date at 00:00:00Z. */
export function fromDateString(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Inclusive date range for reports (returns [start, endExclusive)). */
export function dateRange(from: string, to: string): { start: Date; end: Date } {
  const start = fromDateString(from);
  const end = new Date(fromDateString(to).getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/** JSON-safe output (dates → ISO strings, ObjectId → string). */
export function serialize<T>(doc: Record<string, unknown>): T {
  return JSON.parse(
    JSON.stringify(doc, (_k, v) => {
      if (v instanceof Date) return v.toISOString();

      const maybeObjectId = v as { _bsontype?: unknown } | null;
      if (
        maybeObjectId &&
        typeof maybeObjectId === "object" &&
        maybeObjectId._bsontype === "ObjectID"
      ) {
        return String(v);
      }

      return v;
    })
  ) as T;
}