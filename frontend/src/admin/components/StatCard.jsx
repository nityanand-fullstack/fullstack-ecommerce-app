export default function StatCard({ label, value, delta, tone = "brand", icon }) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  const positive = (delta || "").startsWith("+");

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {delta && (
            <p
              className={`mt-1 text-xs font-medium ${
                positive ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {delta} vs last week
            </p>
          )}
        </div>
        <div className={`h-11 w-11 grid place-items-center rounded-xl ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
