"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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

      setSuccess(isEdit ? "Note updated." : "Note saved.");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            className="input"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            disabled={initial.id !== null} // once created, date is fixed
            required
          />
          {initial.id !== null ? (
            <p className="muted mt-1 text-xs">
              A note already exists for {initial.date}. Pick a future date to create a new one.
            </p>
          ) : null}
        </div>

        <div>
          <label className="label" htmlFor="weather">Weather</label>
          <select
            id="weather"
            className="input"
            value={weather}
            onChange={(e) => setWeather(e.target.value as Weather)}
          >
            <option value="sunny">Sunny</option>
            <option value="cloudy">Cloudy</option>
            <option value="rainy">Rainy</option>
            <option value="stormy">Stormy</option>
            <option value="other">Other</option>
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
          placeholder="Leave blank to derive from sales"
        />
      </div>

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}

      <div className="flex items-center gap-3">
        <button className="btn" type="submit" disabled={saving || pending}>
          {saving ? "Saving…" : isEdit ? "Update note" : "Save note"}
        </button>
        {initial.id !== null ? (
          <span className="muted text-xs">Editing existing note for {initial.date}</span>
        ) : null}
      </div>
    </form>
  );
}