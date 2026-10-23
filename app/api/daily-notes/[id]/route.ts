import { withOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { DailyNoteUpdateSchema } from "@/lib/models";
import { parseJson } from "@/lib/validation";
import { ObjectId } from "mongodb";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withOwner(async (owner) => {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const body = await parseJson(req, DailyNoteUpdateSchema);

    const res = await (await collection("dailyNotes")).updateOne(
      { _id: new ObjectId(id), ownerId: owner.clerkUserId },
      { $set: { ...body, updatedAt: new Date() } }
    );

    if (res.matchedCount === 0) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withOwner(async (owner) => {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const res = await (await collection("dailyNotes")).deleteOne({
      _id: new ObjectId(id),
      ownerId: owner.clerkUserId,
    });

    if (res.deletedCount === 0) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  });
}