import clsx from "clsx";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react-native";
import { ReactNode } from "react";
import { Text, View } from "react-native";

type AlertVariant = "primary" | "success" | "error" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
}

const variants = {
  primary: {
    container: "bg-primary border-primary",
    icon: CheckCircle2,
    color: "#fff",
  },
  success: {
    container: "bg-green-800",
    icon: CheckCircle2,
    color: "#fff",
  },
  error: {
    container: "bg-red-800",
    icon: AlertCircle,
    color: "#fff",
  },
  warning: {
    container: "bg-yellow-800 ",
    icon: TriangleAlert,
    color: "#fff",
  },
  info: {
    container: "bg-blue-800 ",
    icon: Info,
    color: "#fff",
  },
};

export default function Alert({
  variant = "info",
  title,
  children,
}: AlertProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <View className={clsx("flex-row rounded-2xl border p-4", config.container)}>
      <Icon size={22} color={config.color} />

      <View className="ml-3 flex-1">
        {title && (
          <Text className="text-base font-semibold text-white">{title}</Text>
        )}

        <Text className="mt-1 text-sm leading-5 text-white">{children}</Text>
      </View>
    </View>
  );
}
