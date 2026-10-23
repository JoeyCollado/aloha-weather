import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "warning" | "success";
}

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  const valueColor =
    tone === "warning" ? "var(--danger)" : tone === "success" ? "var(--success)" : "var(--fg)";

  return (
    <div className="card">
      <div className="muted text-xs uppercase tracking-wide">{label}</div>
      <div className="mt-2 text-2xl font-semibold" style={{ color: valueColor }}>
        {value}
      </div>
      {hint ? <div className="muted mt-1 text-xs">{hint}</div> : null}
    </div>
  );
}