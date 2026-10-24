import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { collection } from "@/lib/db";
import { toDateString } from "@/lib/validation";
import { DailyLogForm } from "@/components/DailyLogForm";
import { FiEdit3, FiAlertCircle } from "react-icons/fi";

export const dynamic = "force-dynamic";

interface DailyNoteDoc {
  _id: string;
  date: string;
  weather: string;
  remarks?: string;
  orderCount?: number;
}

export default async function DailyLogPage() {
  let owner;
  try {
    owner = await requireOwner();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return (
        <div className="p-8 text-center card max-w-md mx-auto mt-20">
          <FiAlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        </div>
      );
    }
    throw err;
  }

  const today = toDateString(new Date());
  const todayNote = await (await collection("dailyNotes")).findOne({
    ownerId: owner.clerkUserId,
    date: today,
  });

  const recent = await (await collection("dailyNotes"))
    .find({ ownerId: owner.clerkUserId })
    .sort({ date: -1 })
    .limit(14)
    .toArray();

  const plainRecent = JSON.parse(JSON.stringify(recent)) as DailyNoteDoc[];

  const initial = todayNote
    ? {
        id: String(todayNote._id),
        date: todayNote.date,
        weather: todayNote.weather as "sunny" | "cloudy" | "rainy" | "stormy" | "other",
        remarks: todayNote.remarks ?? "",
        orderCount: todayNote.orderCount ?? null,
      }
    : { 
        id: null, 
        date: today, 
        weather: "sunny" as const, 
        remarks: "", 
        orderCount: null 
      };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <FiEdit3 className="text-[var(--brand)]" /> Daily Log
        </h1>
        <p className="text-gray-500 mt-1">Record today&apos;s weather conditions and business notes.</p>
      </header>

      <DailyLogForm initial={initial} />

      <section className="card p-0 overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] bg-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Notes</h2>
        </div>
        {plainRecent.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notes logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-[var(--border)] text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Weather</th>
                  <th className="px-6 py-4 font-semibold">Remarks</th>
                  <th className="px-6 py-4 font-semibold text-right">Orders</th>
                </tr>
              </thead>
              <tbody>
                {plainRecent.map((n) => (
                  <tr key={n._id} className="border-b border-[var(--border)] last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{n.date}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {n.weather}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{n.remarks || "—"}</td>
                    <td className="px-6 py-4 text-right font-medium">{n.orderCount ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}