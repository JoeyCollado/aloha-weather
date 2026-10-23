import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { collection } from "@/lib/db";
import { toDateString } from "@/lib/validation";
import { WeatherSalesTable } from "@/components/WeatherSalesTable";

export const dynamic = "force-dynamic";

interface Row {
  date: string;
  weather: string;
  orderCount: number;
  salesTotal: number;
}

export default async function WeatherSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  let owner;
  try {
    owner = await requireOwner();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You are signed in, but you do not have the "owner" role.</p>
        </div>
      );
    }
    throw err;
  }

  const ownerId = owner.clerkUserId;
  const params = await searchParams;

  const todayStr = toDateString(new Date());
  const to = params.to ?? todayStr;
  const from =
    params.from ??
    toDateString(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));

  const start = new Date(`${from}T00:00:00`);
  const end = new Date(new Date(`${to}T00:00:00`).getTime() + 24 * 60 * 60 * 1000);

  // Sales grouped by date
  const salesByDate = await (await collection("sales"))
    .aggregate([
      {
        $match: {
          ownerId,
          status: "paid",
          createdAt: { $gte: start, $lt: end },
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
    ])
    .toArray();

  // Notes in the same range
  const notes = await (await collection("dailyNotes"))
    .find({
      ownerId,
      date: { $gte: from, $lte: to },
    })
    .toArray();

  const noteByDate = new Map(notes.map((n) => [n.date as string, n]));

  const rows: Row[] = salesByDate.map((s) => {
    const date = s._id as string;
    const note = noteByDate.get(date);
    return {
      date,
      weather: note?.weather ?? "—",
      orderCount: s.count as number,
      salesTotal: s.total as number,
    };
  });

  // Also include days with a note but no sales (useful signal!)
  for (const n of notes) {
    if (!rows.find((r) => r.date === n.date)) {
      rows.push({
        date: n.date as string,
        weather: n.weather as string,
        orderCount: 0,
        salesTotal: 0,
      });
    }
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first

  // Weather buckets
  const buckets = new Map<string, { days: number; sales: number; orders: number }>();
  for (const r of rows) {
    if (r.weather === "—") continue;
    const b = buckets.get(r.weather) ?? { days: 0, sales: 0, orders: 0 };
    b.days += 1;
    b.sales += r.salesTotal;
    b.orders += r.orderCount;
    buckets.set(r.weather, b);
  }
  const bucketRows = Array.from(buckets.entries()).map(([weather, b]) => ({
    weather,
    days: b.days,
    avgSales: b.sales / b.days,
    avgOrders: b.orders / b.days,
  }));
  bucketRows.sort((a, b) => b.avgSales - a.avgSales);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Weather vs Sales</h1>
        <p className="muted text-sm">
          Compare daily sales against logged weather. Range: {from} → {to}
        </p>
      </header>

      <form className="card grid gap-3 sm:grid-cols-[1fr_1fr_auto]" method="get">
        <div>
          <label className="label" htmlFor="from">From</label>
          <input id="from" name="from" type="date" className="input" defaultValue={from} />
        </div>
        <div>
          <label className="label" htmlFor="to">To</label>
          <input id="to" name="to" type="date" className="input" defaultValue={to} />
        </div>
        <div className="flex items-end">
          <button className="btn" type="submit">Apply</button>
        </div>
      </form>

      <WeatherSalesTable rows={rows} buckets={bucketRows} />
    </div>
  );
}