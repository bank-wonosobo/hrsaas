import clsx from "clsx";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";

interface Props extends PressableProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "success";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  outline: "border border-primary text-primary",
  danger: "bg-red-500 text-white",
  success: "bg-green-500 text-white",
};

const textVariants: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-white",
  outline: "text-gray-500",
  danger: "text-white",
  success: "text-white",
};

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  loading = false,
  disabled,
  className,
  ...props
}: Props) {
  return (
    <Pressable
      className={clsx(
        "rounded-full px-5 py-3 items-center justify-center flex-row active:scale-[97%]",
        variants[variant],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-80",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          color={variant === "outline" ? "#2563EB" : "white"}
          className="mr-2"
        />
      )}
      <Text
        className={clsx(
          "font-medium text-base font-google-flex",
          textVariants[variant],
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}
