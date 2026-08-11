"use client";
import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";
import { SyncLoader } from "react-spinners";

type Props = {
  children: React.ReactNode;
  icon?: boolean;
  variant?:
    | "primary"
    | "secondary"
    | "third"
    | "outline"
    | "ghost"
    | "danger"
    | "link";
  size?: "sm" | "md" | "lg";
  className?: string;
  loading?: boolean;
  asChild?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  icon = false,
  variant = "primary",
  size = "md",
  className,
  disabled,
  loading,
  asChild = false,
  prefixIcon,
  suffixIcon,
  ...props
}: Props) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  const baseStyle =
    "rounded-lg px-6 py-3 font-medium h-fit active:scale-[97%] cursor-pointer flex items-center justify-center gap-1";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-800 disabled:bg-zinc-200",
    secondary: "bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-200",
    third:
      "p-2! bg-zinc-100 text-black hover:bg-zinc-200 disabled:bg-zinc-200 rounded-full!",
    outline: "border border-zinc-300 text-zinc-900 hover:bg-zinc-100",
    ghost: "text-zinc-900 hover:bg-zinc-50 p-2!",
    danger: "bg-red-500 text-white hover:bg-red-600",
    link: "text-sm! underline font-medium! text-black! p-1! hover:font-semibold!",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-md",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <Comp
      className={clsx(
        baseStyle,
        variants[variant],
        sizes[size],
        className,
        icon && "rounded-full!",
        {
          "w-fit": asChild,
        },
      )}
      {...(!asChild && { disabled: isDisabled })}
      {...props}
    >
      <div className="w-full flex justify-center items-center ">
        <div className="w-full flex justify-center items-center gap-2">
          {loading ? (
            <SyncLoader size={8} className="py-2" />
          ) : (
            <>
              {prefixIcon && (
                <span className="flex items-center">{prefixIcon}</span>
              )}
              <span>{children}</span>
              {suffixIcon && (
                <span className="flex items-center">{suffixIcon}</span>
              )}
            </>
          )}
        </div>
      </div>
    </Comp>
  );
}
