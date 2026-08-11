import clsx from "clsx";
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import AppModal from "./modal";

export type SelectOption = {
  label: string;
  value: string;
};

interface Props {
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export default function Select({
  placeholder = "Pilih...",
  options,
  value,
  onChange,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={clsx(
          "flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4",
          error ? "border-red-500" : "border-gray-200",
        )}
      >
        <Text
          className={clsx(
            "font-poppins-regular",
            selected ? "text-text" : "text-gray-400",
          )}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={18} color="#9ca3af" />
      </Pressable>

      <AppModal visible={open} title={placeholder} onClose={() => setOpen(false)}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => {
              onChange(option.value);
              setOpen(false);
            }}
            className={clsx(
              "py-3 px-2 border-b border-gray-100",
              option.value === value && "bg-primary/5",
            )}
          >
            <Text
              className={clsx(
                "font-poppins-medium text-sm",
                option.value === value ? "text-primary" : "text-text",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </AppModal>
    </>
  );
}
