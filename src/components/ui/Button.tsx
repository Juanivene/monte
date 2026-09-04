import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-bone hover:bg-ink-soft disabled:bg-concrete disabled:text-bone/70",
  secondary:
    "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-bone disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink",
  ghost: "text-ink-soft hover:bg-ink/5 disabled:opacity-40",
  danger: "bg-red-700 text-white hover:bg-red-800 disabled:bg-red-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-2 text-[0.7rem] tracking-[0.14em]",
  md: "px-6 py-3 text-[0.75rem] tracking-[0.16em]",
  lg: "px-8 py-4 text-[0.8rem] tracking-[0.18em]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button({ variant = "primary", size = "md", className = "", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-xs font-display font-semibold uppercase transition-[background-color,color,border-color,transform] duration-300 active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
});
