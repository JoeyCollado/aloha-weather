import { withOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { COLLECTIONS } from "@/lib/models";
import { XMLBuilder } from "fast-xml-parser";

export async function GET() {
  return withOwner(async (owner) => {
    const db = await getDb();

    // Fetch all data scoped to the owner
    const dailyNotes = await db.collection(COLLECTIONS.dailyNotes).find({ ownerId: owner.clerkUserId }).toArray();
    const sales = await db.collection(COLLECTIONS.sales).find({ ownerId: owner.clerkUserId }).toArray();
    const items = await db.collection(COLLECTIONS.items).find({ ownerId: owner.clerkUserId }).toArray();

    // Build XML
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      suppressEmptyNode: true,
    });

    const data = {
      alohaExport: {
        exportedAt: new Date().toISOString(),
        ownerId: owner.clerkUserId,
        dailyNotes: { note: dailyNotes },
        sales: { sale: sales },
        items: { item: items },
      },
    };

    const xml = builder.build(data);

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="aloha-weather-export-${new Date().toISOString().split("T")[0]}.xml"`,
      },
    });
  });
}