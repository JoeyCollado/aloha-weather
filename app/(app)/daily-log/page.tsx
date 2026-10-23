import { requireOwner, UnauthorizedError } from "@/lib/auth";
import { collection } from "@/lib/db";
import { toDateString } from "@/lib/validation";
import { DailyLogForm } from "@/components/DailyLogForm";

export const dynamic = "force-dynamic";

export default async function DailyLogPage() {
  let owner;
  try {
    owner = await requireOwner();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You are signed in, but you do not have the "owner" role.</p>
          <p className="text-gray-600 mt-2">Please go to    the Clerk Dashboard, add {"{\"role\": \"owner\"}"} to your Public Metadata, and sign out and back in.</p>
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

  const initial = todayNote
    ? {
        id: String(todayNote._id),
        date: todayNote.date,
        weather: todayNote.weather,
        remarks: todayNote.remarks ?? "",
        orderCount: todayNote.orderCount ?? null,
      }
    : { id: null, date: today, weather: "sunny" as const, remarks: "", orderCount: null };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Daily Log</h1>
        <p className="muted text-sm">One note per day. Editing today's note will update it in place.</p>
      </header>

      <DailyLogForm initial={initial} />

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Recent Notes</h2>
        {recent.length === 0 ? (
          <p className="muted text-sm">No notes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: "var(--muted)" }}>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Weather</th>
                  <th className="py-2 pr-3">Remarks</th>
                  <th className="py-2 pr-3">Orders</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((n) => (
                  <tr key={String(n._id)} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="py-2 pr-3">{n.date}</td>
                    <td className="py-2 pr-3 capitalize">{n.weather}</td>
                    <td className="py-2 pr-3">{n.remarks ?? "—"}</td>
                    <td className="py-2 pr-3">{n.orderCount ?? "—"}</td>
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