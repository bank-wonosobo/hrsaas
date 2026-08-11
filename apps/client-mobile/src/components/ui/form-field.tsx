import { ReactNode } from "react";
import { Text, View } from "react-native";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export default function FormField({
  label,
  required,
  error,
  children,
}: FormFieldProps) {
  return (
    <View className="mb-5">
      <Text className="mb-2 font-poppins-medium text-sm text-text">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>

      {children}

      {!!error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
