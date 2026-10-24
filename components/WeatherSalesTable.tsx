"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiCloud, FiSun, FiCloudRain, FiCloudLightning, FiTrendingUp, FiDollarSign, FiClock } from "react-icons/fi";

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

const getWeatherIcon = (weather: string) => {
  switch (weather.toLowerCase()) {
    case "sunny": return <FiSun className="text-yellow-500" size={20} />;
    case "cloudy": return <FiCloud className="text-gray-400" size={20} />;
    case "rainy": return <FiCloudRain className="text-blue-500" size={20} />;
    case "stormy": return <FiCloudLightning className="text-purple-600" size={20} />;
    default: return <FiCloud className="text-gray-300" size={20} />;
  }
};

export function WeatherSalesTable({ rows, buckets }: { rows: Row[]; buckets: BucketRow[] }) {
  return (
    <div className="space-y-8">
      {/* Weather Averages Cards */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-[var(--brand)]" /> Average Performance by Weather
        </h2>
        {buckets.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">No weather-tagged data in this range.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence>
              {buckets.map((b) => (
                <motion.div 
                  key={b.weather}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="capitalize font-bold text-lg text-gray-800 flex items-center gap-2">
                      {getWeatherIcon(b.weather)} {b.weather}
                    </div>
                    <div className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {b.days} days
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center gap-1"><FiDollarSign size={14}/> Avg Sales</span>
                      <span className="font-bold text-green-600">₱{b.avgSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center gap-1"><FiClock size={14}/> Avg Orders</span>
                      <span className="font-bold text-gray-800">{b.avgOrders.toFixed(1)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Daily Detail Table */}
      <section className="card p-0 overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] bg-gray-50">
          <h2 className="font-bold text-gray-900 text-lg">Daily Breakdown</h2>
        </div>
        {rows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No records found for this date range.</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-[var(--border)] text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Weather Condition</th>
                    <th className="px-6 py-4 font-semibold text-right">Total Orders</th>
                    <th className="px-6 py-4 font-semibold text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {rows.map((r) => (
                      <motion.tr 
                        key={r.date}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-[var(--border)] last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">{new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="px-6 py-4">
                          <span className="capitalize inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {getWeatherIcon(r.weather)} {r.weather}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium">{r.orderCount}</td>
                        <td className="px-6 py-4 text-right font-bold text-green-600">₱{r.salesTotal.toFixed(2)}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              <AnimatePresence>
                {rows.map((r) => (
                  <motion.div key={r.date} className="border border-[var(--border)] rounded-lg p-4 bg-gray-50 flex flex-col gap-3">
                    <div className="font-semibold text-gray-900 border-b pb-2 border-[var(--border)]">{r.date}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Weather</span>
                      <span className="capitalize inline-flex items-center gap-1.5 font-medium text-sm">
                        {getWeatherIcon(r.weather)} {r.weather}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Orders</span>
                      <span className="font-medium">{r.orderCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Revenue</span>
                      <span className="font-bold text-green-600">₱{r.salesTotal.toFixed(2)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </section>
    </div>
  );
}