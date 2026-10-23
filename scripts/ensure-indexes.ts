import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { ensureIndexes } = await import("../lib/db");
  console.log("[ensure-indexes] connecting + creating indexes...");
  await ensureIndexes();
  console.log("[ensure-indexes] done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[ensure-indexes] failed:", err);
  process.exit(1);
});