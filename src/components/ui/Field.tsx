import { forwardRef } from "react";

const inputClasses =
  "w-full rounded-xs border border-ink/15 bg-bone-dark/50 px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 hover:border-ink/30 focus:border-ink focus:bg-sand disabled:bg-bone-dark disabled:text-ink-muted";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${inputClasses} ${className}`} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={`${inputClasses} ${className}`} {...props} />;
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", ...props }, ref) {
  return <select ref={ref} className={`${inputClasses} bg-bone-dark ${className}`} {...props} />;
});

export function Label({
  children,
  htmlFor,
  required,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="eyebrow text-ink-muted mb-2 block">
      {children}
      {required && <span className="text-accent-deep"> *</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="dark:text-red-400 mt-1.5 text-xs text-red-700">{message}</p>;
}
