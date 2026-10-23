import Link from "next/link";
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { collection } from "@/lib/db";
import { toDateString } from "@/lib/validation";
import { StatCard } from "@/components/StatCard";

export const dynamic = "force-dynamic";

interface LowStockItem {
  _id: string;
  name: string;
  quantity: number;
  reorderLevel: number;
  unit: string;
}

export default async function DashboardPage() {
  let owner;
  try {
    owner = await requireOwner();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      // If unauthorized, render a message instead of redirecting (prevents loop)
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You are signed in, but you do not have the &quot;owner&quot; role.</p>
          <p className="text-gray-600 mt-2">Please go to the Clerk Dashboard, add {"{\"role\": \"owner\"}"} to your Public Metadata, and sign out and back in.</p>
        </div>
      );
    }
    throw err;
  }
  
  const ownerId = owner.clerkUserId;

  const today = toDateString(new Date());
  const todayStart = new Date(`${today}T00:00:00`);
  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);

  const [
    todayNote,
    todaySalesAgg,
    last7Agg,
    itemsTotal,
    lowStockDocs,
    totalStockValueAgg,
  ] = await Promise.all([
    (await collection("dailyNotes")).findOne({ ownerId, date: today }),
    (await collection("sales")).aggregate([
      {
        $match: {
          ownerId,
          status: "paid",
          createdAt: { $gte: todayStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
    ]).toArray(),
    (await collection("sales")).aggregate([
      {
        $match: {
          ownerId,
          status: "paid",
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray(),
    (await collection("items")).countDocuments({ ownerId }),
    (await collection("items"))
      .find({ ownerId, $expr: { $lte: ["$quantity", "$reorderLevel"] } })
      .project<LowStockItem>({ name: 1, quantity: 1, reorderLevel: 1, unit: 1 })
      .limit(20)
      .toArray(),
    (await collection("items")).aggregate([
      { $match: { ownerId } },
      { $group: { _id: null, value: { $sum: { $multiply: ["$quantity", "$unitCost"] } } } },
    ]).toArray(),
  ]);

  const todaySales = todaySalesAgg[0]?.total ?? 0;
  const todayCount = todaySalesAgg[0]?.count ?? 0;
  const last7Total = last7Agg.reduce((s, r) => s + r.total, 0);
  const totalStockValue = totalStockValueAgg[0]?.value ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="muted text-sm">
          {new Date().toLocaleDateString("en-PH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <section className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="muted text-xs uppercase tracking-wide">Today&apos;s Weather</div>
            {todayNote ? (
              <>
                <div className="mt-1 text-2xl font-semibold capitalize">{todayNote.weather}</div>
                {todayNote.remarks ? (
                  <p className="muted mt-1 text-sm">{todayNote.remarks}</p>
                ) : null}
              </>
            ) : (
              <div className="mt-1 text-lg">No note logged yet for today.</div>
            )}
          </div>
          <Link href="/daily-log" className="btn">
            {todayNote ? "Edit" : "Log now"}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Sales"
          value={`₱${todaySales.toFixed(2)}`}
          hint={`${todayCount} order${todayCount === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Last 7 Days"
          value={`₱${last7Total.toFixed(2)}`}
          hint={`${last7Agg.length} day${last7Agg.length === 1 ? "" : "s"} with sales`}
        />
        <StatCard
          label="Inventory Items"
          value={itemsTotal}
          hint={`${lowStockDocs.length} low-stock alert${lowStockDocs.length === 1 ? "" : "s"}`}
          tone={lowStockDocs.length > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Total Stock Value"
          value={`₱${totalStockValue.toFixed(2)}`}
          hint="quantity × unit cost"
        />
      </section>

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Low-Stock Alerts</h2>
          <span className="muted text-xs">quantity ≤ reorder level</span>
        </div>
        {lowStockDocs.length === 0 ? (
          <p className="muted text-sm">All items are above their reorder levels.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {lowStockDocs.map((item) => (
              <li key={String(item._id)} className="flex items-center justify-between py-2">
                <span className="text-sm">{item.name}</span>
                <span className="text-sm" style={{ color: "var(--danger)" }}>
                  {item.quantity} {item.unit} (reorder at {item.reorderLevel})
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}