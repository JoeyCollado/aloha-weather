import { MongoClient, Db, Collection, Document } from "mongodb";
import { COLLECTIONS, type CollectionKey } from "./models";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 8000,
  retryWrites: true,
};

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.local.example to .env.local and fill it in."
    );
  }
  return uri;
}

function getClientPromise(): Promise<MongoClient> {
  return (global._mongoClientPromise ??= new MongoClient(getUri(), options).connect());
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB ?? "aloha_rmr");
}

export async function collection<K extends CollectionKey>(
  name: K
): Promise<Collection<Document>> {
  return (await getDb()).collection(COLLECTIONS[name]);
}

export async function ensureIndexes(): Promise<void> {
  const db = await getDb();

  await db.collection(COLLECTIONS.users).createIndex(
    { clerkUserId: 1 },
    { unique: true, name: "uniq_clerkUserId" }
  );

  await db.collection(COLLECTIONS.items).createIndexes([
    { key: { ownerId: 1 }, name: "owner_items" },
    { key: { ownerId: 1, quantity: 1, reorderLevel: 1 }, name: "owner_lowstock" },
  ]);

  await db.collection(COLLECTIONS.products).createIndexes([
    { key: { ownerId: 1 }, name: "owner_products" },
    { key: { ownerId: 1, active: 1 }, name: "owner_products_active" },
  ]);

  await db.collection(COLLECTIONS.recipes).createIndexes([
    { key: { ownerId: 1, productId: 1 }, name: "owner_recipe_product" },
    { key: { ownerId: 1, itemId: 1 }, name: "owner_recipe_item" },
  ]);

  await db.collection(COLLECTIONS.movements).createIndexes([
    { key: { ownerId: 1, createdAt: -1 }, name: "owner_movements_recent" },
    { key: { ownerId: 1, itemId: 1, createdAt: -1 }, name: "owner_movements_item" },
    { key: { ownerId: 1, saleId: 1 }, name: "owner_movements_sale", sparse: true },
  ]);

  await db.collection(COLLECTIONS.sales).createIndexes([
    { key: { ownerId: 1, createdAt: -1 }, name: "owner_sales_recent" },
    { key: { ownerId: 1, saleNumber: 1 }, name: "owner_sales_number", unique: true },
    { key: { ownerId: 1, status: 1 }, name: "owner_sales_status" },
  ]);

  await db.collection(COLLECTIONS.saleItems).createIndexes([
    { key: { ownerId: 1, saleId: 1 }, name: "owner_saleitems_sale" },
    { key: { ownerId: 1, productId: 1 }, name: "owner_saleitems_product" },
  ]);

  await db.collection(COLLECTIONS.payments).createIndexes([
    { key: { ownerId: 1, saleId: 1 }, name: "owner_payments_sale" },
    { key: { ownerId: 1, idempotencyKey: 1 }, name: "owner_payments_idem", unique: true },
  ]);

  await db.collection(COLLECTIONS.dailyNotes).createIndexes([
    { key: { ownerId: 1, date: 1 }, name: "uniq_owner_date", unique: true },
    { key: { ownerId: 1, weather: 1, date: -1 }, name: "owner_weather" },
  ]);
}