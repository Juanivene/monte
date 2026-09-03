import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary: "bg-neutral-900 text-white hover:bg-neutral-700 disabled:bg-neutral-300",
  secondary:
    "bg-white text-neutral-900 border border-neutral-300 hover:border-neutral-500 disabled:opacity-50",
  ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100 disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ variant = "primary", className = "", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
});
