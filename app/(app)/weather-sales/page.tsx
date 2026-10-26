import { requireOwner } from "@/lib/auth";
import { collection } from "@/lib/db";
import { toDateString } from "@/lib/validation";
import { WeatherSalesTable } from "@/components/WeatherSalesTable";
import { FiTrendingUp, FiFilter } from "react-icons/fi";

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
  // Layout handles the unauthorized check globally
  const owner = await requireOwner();
  const ownerId = owner.clerkUserId;
  
  const params = await searchParams;

  const now = new Date();
  const todayStr = toDateString(now);
  const to = params.to ?? todayStr;
  const from = params.from ?? toDateString(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));

  const start = new Date(`${from}T00:00:00`);
  const end = new Date(new Date(`${to}T00:00:00`).getTime() + 24 * 60 * 60 * 1000);

  // Fetch sales
  const salesByDate = await (await collection("sales"))
    .aggregate([
      { $match: { ownerId, status: "paid", createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$total" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    .toArray();

  // Fetch weather notes
  const notes = await (await collection("dailyNotes"))
    .find({ ownerId, date: { $gte: from, $lte: to } })
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

  // Include days with notes but no sales (useful to show "0 sales on rainy day")
  for (const n of notes) {
    if (!rows.find((r) => r.date === n.date)) {
      rows.push({ date: n.date as string, weather: n.weather as string, orderCount: 0, salesTotal: 0 });
    }
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first

  // Calculate buckets
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
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FiTrendingUp className="text-[var(--brand)]" /> Weather vs Sales
          </h1>
          <p className="text-gray-500 mt-1">Analyze how weather conditions affect your daily revenue.</p>
        </div>
      </header>

      {/* Date Filter */}
      <form className="card grid gap-4 sm:grid-cols-[1fr_1fr_auto] items-end border-t-4 border-t-[var(--brand)]" method="get">
        <div>
          <label className="label text-gray-600 font-semibold flex items-center gap-2"><FiFilter /> From Date</label>
          <input id="from" name="from" type="date" className="input" defaultValue={from} />
        </div>
        <div>
          <label className="label text-gray-600 font-semibold flex items-center gap-2"><FiFilter /> To Date</label>
          <input id="to" name="to" type="date" className="input" defaultValue={to} />
        </div>
        <div>
          <button className="btn w-full sm:w-auto px-8" type="submit">Apply Filter</button>
        </div>
      </form>

      <WeatherSalesTable rows={rows} buckets={bucketRows} />
    </div>
  );
}