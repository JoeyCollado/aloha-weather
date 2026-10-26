import Link from "next/link";
import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { collection } from "@/lib/db";
import { toDateString } from "@/lib/validation";
import { FiCloud, FiTrendingUp, FiShoppingBag, FiAlertCircle, FiCreditCard } from "react-icons/fi";

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
      return (
        <div className="p-8 text-center card max-w-md mx-auto mt-20">
          <FiAlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have the &quot;owner&quot; role.</p>
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
      { $match: { ownerId, status: "paid", createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]).toArray(),
    (await collection("sales")).aggregate([
      { $match: { ownerId, status: "paid", createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$total" } } },
    ]).toArray(),
    (await collection("items")).countDocuments({ ownerId }),
    (await collection("items"))
      .find({ ownerId, $expr: { $lte: ["$quantity", "$reorderLevel"] } })
      .project<LowStockItem>({ name: 1, quantity: 1, reorderLevel: 1, unit: 1 })
      .limit(10)
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
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Here is your daily snapshot.</p>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border border-(--border) shadow-sm">
          {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </header>

      {/* Today's Weather Widget */}
      <section className="card border-l-4 border-l-(--brand) flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-(--brand) rounded-xl">
            <FiCloud size={32} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Today&apos;s Weather</div>
            {todayNote ? (
              <>
                <div className="text-2xl font-bold text-gray-900 capitalize mt-1">{todayNote.weather}</div>
                {todayNote.remarks && <p className="text-sm text-gray-500 mt-1">{todayNote.remarks}</p>}
              </>
            ) : (
              <div className="text-lg font-medium text-gray-400 mt-1">No weather note logged yet.</div>
            )}
          </div>
        </div>
        <Link href="/daily-log" className="btn whitespace-nowrap">
          {todayNote ? "Edit Log" : "Log Weather"}
        </Link>
      </section>

      {/* Stat Cards Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <FiCreditCard size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today&apos;s Sales</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">₱{todaySales.toFixed(2)}</div>
            <div className="text-xs text-gray-400">{todayCount} orders</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FiTrendingUp size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last 7 Days</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">₱{last7Total.toFixed(2)}</div>
            <div className="text-xs text-gray-400">{last7Agg.length} active days</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <FiShoppingBag size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory Items</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{itemsTotal}</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
            <FiCreditCard size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Value</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">₱{totalStockValue.toFixed(2)}</div>
          </div>
        </div>
      </section>

      {/* Low Stock Table */}
      <section className="card p-0 overflow-hidden">
        <div className="p-6 border-b border-(--border) bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Low-Stock Alerts</h2>
          <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-(--border)">Quantity ≤ Reorder Level</span>
        </div>
        {lowStockDocs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            All items are currently above their reorder levels.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-(--border) text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Item Name</th>
                <th className="px-6 py-4 font-semibold text-right">Current Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              {lowStockDocs.map((item) => (
                <tr key={String(item._id)} className="border-b border-(--border) last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{item.quantity}</span>
                      <span className="text-xs font-normal text-gray-400">/ {item.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{item.reorderLevel}</span>
                      <span className="text-xs font-normal text-gray-400">/ {item.unit}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}