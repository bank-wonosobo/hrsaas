import clsx from "clsx";
import { ReactNode } from "react";
import { Text, View } from "react-native";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

type BadgeSize = "sm" | "md" | "lg";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-neutral-200",
  primary: "bg-primary",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-cyan-500",
  outline: "border border-neutral-300 bg-transparent",
};

const textStyles: Record<BadgeVariant, string> = {
  default: "text-neutral-800",
  primary: "text-white",
  success: "text-white",
  warning: "text-white",
  danger: "text-white",
  info: "text-white",
  outline: "text-neutral-700",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5",
  md: "px-2.5 py-1",
  lg: "px-3 py-1.5",
};

const textSizeStyles: Record<BadgeSize, string> = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <View
      className={clsx(
        "self-start rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      <Text
        className={clsx(
          "font-medium",
          textStyles[variant],
          textSizeStyles[size],
        )}
      >
        {children}
      </Text>
    </View>
  );
}
