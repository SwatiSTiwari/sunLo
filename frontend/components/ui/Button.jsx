export default function Button({
  children,
  variant = "primary",
  className = "",
  isLoading = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center px-6 py-3 rounded-sunlo font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-gradient-to-r from-sunlo-primary to-sunlo-accent text-white shadow-button hover:from-sunlo-primary-dark hover:to-sunlo-primary focus:ring-sunlo-primary",
    secondary:
      "bg-sunlo-secondary text-sunlo-text hover:bg-yellow-200 shadow-soft focus:ring-sunlo-secondary",
    outline:
      "border-2 border-sunlo-primary text-sunlo-primary hover:bg-sunlo-primary hover:text-white focus:ring-sunlo-primary",
    ghost: "text-sunlo-text hover:bg-orange-100 focus:ring-sunlo-secondary",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
}
