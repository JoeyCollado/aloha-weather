import { config } from "dotenv";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { XMLBuilder } from "fast-xml-parser";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { getDb } = await import("../lib/db");
  const { COLLECTIONS } = await import("../lib/models");

  const ownerId = process.env.OWNER_CLERK_USER_ID;
  if (!ownerId) throw new Error("OWNER_CLERK_USER_ID missing");

  const db = await getDb();
  
  console.log("[export-xml] fetching data...");
  const dailyNotes = await db.collection(COLLECTIONS.dailyNotes).find({ ownerId }).toArray();
  const sales = await db.collection(COLLECTIONS.sales).find({ ownerId }).toArray();

  const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
  const xml = builder.build({
    export: {
      exportedAt: new Date().toISOString(),
      dailyNotes: { note: dailyNotes },
      sales: { sale: sales },
    },
  });

  const filename = `export-${new Date().toISOString().split("T")[0]}.xml`;
  writeFileSync(filename, xml, "utf8");
  console.log(`[export-xml] wrote ${filename} (${xml.length} bytes)`);
  process.exit(0);
}

main().catch(console.error);