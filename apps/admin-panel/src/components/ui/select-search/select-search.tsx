import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  error?: string;
};

export default function SelectSearch({
  label,
  value,
  options,
  onChange,
  className,
  disabled,
  error,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive = isFocused || !!value;

  const selected = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  // close kalau klik luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-0.5" ref={ref}>
      <div
        className={clsx(
          "relative w-full rounded-xl border bg-white pt-8 pb-4.5 cursor-pointer",
          disabled && "bg-gray-100 cursor-not-allowed",
          selected && "pt-6! pb-2! px-4",
          error
            ? "border-red-500"
            : isFocused
              ? "border-black"
              : "border-gray-300",
          className,
        )}
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => !prev);
          setIsFocused(true);
        }}
      >
        {/* Selected value */}
        <div className="text-sm">{selected ? selected.label : ""}</div>

        {/* Label */}
        <label className="pointer-events-none absolute left-4 top-2 text-xs text-gray-500">
          {label}
        </label>

        {/* Icon */}
        <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
          <ChevronDown size={16} />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="p-2">
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange?.(opt.value);
                      setIsOpen(false);
                      setIsFocused(false);
                    }}
                    className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {opt.label}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-400">
                  No data found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
