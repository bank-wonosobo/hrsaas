"use client";

import clsx from "clsx";

type Variant = "default" | "success" | "warning" | "danger" | "info";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

export default function Badge({
  children,
  variant = "default",
  className,
}: Props) {
  const base =
    "inline-flex items-center px-3 py-1 text-xs font-medium rounded-full";

  const variants: Record<Variant, string> = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={clsx(base, variants[variant], className)}>{children}</span>
  );
}
