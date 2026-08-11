"use client";
import DatePicker from "@/components/shared/date-picker-old/date-picker";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import Input from "../input/input";

interface Props {
  label?: string;
  value?: Date;
  onChange?: (date: Date) => void;
}

export default function InputDate({ label = "Tanggal", value, onChange }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return format(date, "dd/MM/yyyy");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="w-full max-w-md relative z-auto">
      {/* INPUT */}

      <Input
        label={label}
        value={formatDate(value)}
        onClick={() => setOpen((prev) => !prev)}
        readOnly
        className="cursor-pointer"
      />

      {/* DROPDOWN */}
      {open && (
        <div className="absolute z-2 rounded-2xl px-3 mt-2 shadow-custom-lg bg-white  right-0 min-w-[100] shadow-xl">
          <DatePicker
            value={value}
            onChange={(date: Date) => {
              onChange?.(date);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
