import { forwardRef } from "react";

const inputClasses =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900 disabled:bg-neutral-100";

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
  return <select ref={ref} className={`${inputClasses} bg-white ${className}`} {...props} />;
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
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-neutral-800">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}
