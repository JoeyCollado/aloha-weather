"use client";

interface Row {
  date: string;
  weather: string;
  orderCount: number;
  salesTotal: number;
}

interface BucketRow {
  weather: string;
  days: number;
  avgSales: number;
  avgOrders: number;
}

const weatherEmoji: Record<string, string> = {
  sunny: "☀️",
  cloudy: "☁️",
  rainy: "🌧️",
  stormy: "⛈️",
  other: "🌤️",
};

export function WeatherSalesTable({
  rows,
  buckets,
}: {
  rows: Row[];
  buckets: BucketRow[];
}) {
  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">By Weather</h2>
        {buckets.length === 0 ? (
          <p className="muted text-sm">No weather-tagged days in range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: "var(--muted)" }}>
                  <th className="py-2 pr-3">Weather</th>
                  <th className="py-2 pr-3">Days</th>
                  <th className="py-2 pr-3">Avg Sales</th>
                  <th className="py-2 pr-3">Avg Orders</th>
                </tr>
              </thead>
              <tbody>
                {buckets.map((b) => (
                  <tr
                    key={b.weather}
                    className="border-t"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="py-2 pr-3 capitalize">
                      <span className="mr-1">{weatherEmoji[b.weather] ?? ""}</span>
                      {b.weather}
                    </td>
                    <td className="py-2 pr-3">{b.days}</td>
                    <td className="py-2 pr-3">₱{b.avgSales.toFixed(2)}</td>
                    <td className="py-2 pr-3">{b.avgOrders.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Daily Detail</h2>
        {rows.length === 0 ? (
          <p className="muted text-sm">No records in range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: "var(--muted)" }}>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Weather</th>
                  <th className="py-2 pr-3">Orders</th>
                  <th className="py-2 pr-3">Sales</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.date}
                    className="border-t"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="py-2 pr-3">{r.date}</td>
                    <td className="py-2 pr-3 capitalize">
                      <span className="mr-1">{weatherEmoji[r.weather] ?? ""}</span>
                      {r.weather}
                    </td>
                    <td className="py-2 pr-3">{r.orderCount}</td>
                    <td className="py-2 pr-3">₱{r.salesTotal.toFixed(2)}</td>
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