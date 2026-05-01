export default function Stars({ value = 0, size = "sm", interactive = false, onChange }) {
  const sizeClass = size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm";
  const stars = [1, 2, 3, 4, 5];

  if (interactive) {
    return (
      <div className={`inline-flex items-center gap-0.5 ${sizeClass}`}>
        {stars.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange?.(s)}
            className={`transition ${
              s <= value ? "text-amber-500" : "text-slate-300 hover:text-amber-300"
            }`}
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClass}`}>
      {stars.map((s) => (
        <span key={s} className={s <= value ? "text-amber-500" : "text-slate-300"}>
          ★
        </span>
      ))}
    </span>
  );
}
