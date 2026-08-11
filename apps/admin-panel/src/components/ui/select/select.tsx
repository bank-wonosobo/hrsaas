import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  value?: string;
  options: Option[];
  onChange?: (val: string) => void;
  className?: string;
  disabled?: boolean;
  error?: string; // 🔥 tambah ini
};

export default function Select({
  label,
  value,
  options,
  onChange,
  className,
  disabled,
  error,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);

  const isActive = isFocused || !!value;

  return (
    <div className="space-y-0.5">
      <div className={clsx("relative w-full", className)}>
        {/* Select */}
        <select
          disabled={disabled}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={clsx(
            "text-sm w-full appearance-none rounded-xl border bg-white px-4 pt-6 pb-2 transition-all outline-none",
            disabled && "disabled:bg-gray-100 cursor-not-allowed",
            error
              ? "border-red-500"
              : isFocused
                ? "border-black"
                : "border-gray-300",
          )}
        >
          {/* Placeholder kosong */}
          <option value="" disabled hidden></option>

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Label */}
        <label
          className={clsx(
            "pointer-events-none absolute left-4 text-gray-500 transition-all duration-200",
            isActive ? "top-2 text-xs" : "top-1/2 -translate-y-1/2 text-sm",
          )}
        >
          {label}
        </label>

        {/* Icon dropdown */}
        <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
          <ChevronDown size={16} />
        </div>
      </div>

      {/* Error */}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
