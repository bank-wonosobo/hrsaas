"use client";

import clsx from "clsx";

type Props = {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: Props) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}
