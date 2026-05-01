export default function Loader({ fullscreen = false, label = "Loading..." }) {
  const wrap = fullscreen
    ? "fixed inset-0 grid place-items-center bg-white/70 backdrop-blur z-50"
    : "grid place-items-center py-10";
  return (
    <div className={wrap}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
        <span className="text-sm text-slate-500">{label}</span>
      </div>
    </div>
  );
}
