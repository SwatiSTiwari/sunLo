export default function Input({
  label,
  error,
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="mb-2 block text-sm font-semibold text-sunlo-text">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl border border-orange-100 bg-sunlo-background px-4 py-3 text-sunlo-text placeholder-sunlo-muted/60 shadow-sm transition-all focus:border-sunlo-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunlo-secondary/50 ${
          error ? "border-sunlo-error focus:border-sunlo-error focus:ring-red-200" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-sunlo-error">{error}</p>}
    </div>
  );
}
