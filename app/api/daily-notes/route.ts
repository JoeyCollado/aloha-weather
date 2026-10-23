import { withOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { DailyNoteCreateSchema } from "@/lib/models";
import { parseJson, toDateString } from "@/lib/validation";

export async function GET() {
  return withOwner(async (owner) => {
    const notes = await (await collection("dailyNotes"))
      .find({ ownerId: owner.clerkUserId })
      .sort({ date: -1 })
      .limit(50)
      .toArray();
    return Response.json(notes);
  });
}

export async function POST(req: Request) {
  return withOwner(async (owner) => {
    const body = await parseJson(req, DailyNoteCreateSchema);

    // Enforce "no future dates"
    if (body.date > toDateString(new Date())) {
      return Response.json({ error: "Cannot log notes for future dates" }, { status: 400 });
    }

    const doc = {
      ...body,
      ownerId: owner.clerkUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const res = await (await collection("dailyNotes")).insertOne(doc);
      return Response.json({ ok: true, id: res.insertedId });
    } catch (err: unknown) {
      // 11000 is MongoDB's duplicate key error code.
      // It triggers if you try to log two notes for the same date.
      if (typeof err === "object" && err !== null && "code" in err && err.code === 11000) {
        return Response.json(
          { error: "A note already exists for this date. Please edit the existing note." },
          { status: 409 }
        );
      }
      throw err;
    }
  });
}