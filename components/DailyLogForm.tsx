"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSave, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

type Weather = "sunny" | "cloudy" | "rainy" | "stormy" | "other";

interface Initial {
  id: string | null;
  date: string;
  weather: Weather;
  remarks: string;
  orderCount: number | null;
}

interface Props {
  initial: Initial;
}

interface ApiError {
  error?: string;
  fields?: { path: string; message: string }[];
}

export function DailyLogForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [date, setDate] = useState(initial.date);
  const [weather, setWeather] = useState<Weather>(initial.weather);
  const [remarks, setRemarks] = useState(initial.remarks);
  const [orderCount, setOrderCount] = useState<string>(
    initial.orderCount != null ? String(initial.orderCount) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEdit = initial.id !== null && date === initial.date;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const payload = {
      date,
      weather,
      remarks: remarks.trim() === "" ? undefined : remarks.trim(),
      orderCount: orderCount.trim() === "" ? undefined : Number(orderCount),
    };

    try {
      const url = isEdit ? `/api/daily-notes/${initial.id}` : "/api/daily-notes";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? { weather: payload.weather, remarks: payload.remarks, orderCount: payload.orderCount }
        : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json()) as ApiError;
        const fieldMsg = data.fields?.map((f) => `${f.path}: ${f.message}`).join("; ");
        setError(fieldMsg || data.error || `Save failed (${res.status})`);
        return;
      }

      setSuccess(isEdit ? "Note updated successfully." : "Note saved successfully.");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSubmit} 
      className="card space-y-6 border-t-4 border-t-[var(--brand)]"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            className="input"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            disabled={initial.id !== null}
            required
          />
          {initial.id !== null && (
            <p className="text-xs text-orange-600 mt-1 font-medium">
              A note already exists for {initial.date}. You can only edit the weather and remarks.
            </p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="weather">Weather</label>
          <select
            id="weather"
            className="input"
            value={weather}
            onChange={(e) => setWeather(e.target.value as Weather)}
          >
            <option value="sunny">☀️ Sunny</option>
            <option value="cloudy">☁️ Cloudy</option>
            <option value="rainy">🌧️ Rainy</option>
            <option value="stormy">⛈️ Stormy</option>
            <option value="other">🌤️ Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="remarks">Remarks (optional)</label>
        <textarea
          id="remarks"
          className="input"
          rows={3}
          maxLength={500}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="e.g. Heavy rain from 2–5 PM, fewer walk-ins"
        />
      </div>

      <div>
        <label className="label" htmlFor="orderCount">Order Count (optional)</label>
        <input
          id="orderCount"
          type="number"
          min={0}
          step={1}
          className="input"
          value={orderCount}
          onChange={(e) => setOrderCount(e.target.value)}
          placeholder="Leave blank to derive from POS sales"
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
            <FiAlertCircle /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-green-100">
            <FiCheckCircle /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <button className="btn flex items-center gap-2 px-6" type="submit" disabled={saving || pending}>
          {saving ? "Saving..." : <><FiSave size={18} /> {isEdit ? "Update Note" : "Save Note"}</>}
        </button>
      </div>
    </motion.form>
  );
}