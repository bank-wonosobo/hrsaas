import clsx from "clsx";
import { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  error?: boolean;
  type?: "text" | "number";
}
const Input = forwardRef<TextInput, InputProps>(
  ({ className, error, type = "text", keyboardType, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        keyboardType={keyboardType ?? (type === "number" ? "numeric" : "default")}
        placeholderTextColor="#9CA3AF"
        className={clsx(
          "rounded-2xl border bg-white px-4 py-4 font-poppins-regular text-text",
          error ? "border-red-500" : "border-gray-200",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;
