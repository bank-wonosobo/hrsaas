"use client";

import DateRangePicker, {
  DateRange,
} from "@/components/shared/date-range-picker/date-range-picker";
import Button from "@/components/ui/button/button";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Input from "../input/input";

interface Props {
  value?: DateRange;
  labelStart?: string;
  labelEnd?: string;
  onChange?: (date: DateRange) => void;
  className?: string;
}

const DESKTOP_PICKER_WIDTH = 680;

export default function InputDateRange({
  value,
  labelStart,
  labelEnd,
  onChange,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatDate = (date?: Date | null) => {
    if (!date) return "";
    return format(date, "dd/MM/yyyy");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleToggle() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const alignRight = window.innerWidth - rect.left < DESKTOP_PICKER_WIDTH;
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      ...(alignRight
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left }),
    });
    setOpen((prev) => !prev);
  }

  return (
    <div ref={triggerRef} className={`relative ${className ?? ""}`}>
      <div className="flex gap-2">
        <Input
          label={labelStart ?? "Start"}
          value={formatDate(value?.start)}
          onClick={handleToggle}
          readOnly
          className="cursor-pointer"
        />
        <Input
          label={labelEnd ?? "End"}
          value={formatDate(value?.end)}
          onClick={handleToggle}
          readOnly
          className="cursor-pointer"
        />
      </div>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="z-[9999] w-fit max-w-[calc(100vw-2rem)] overflow-x-auto rounded-2xl shadow-xl bg-white"
          >
            <DateRangePicker
              value={value}
              onChange={(range) => {
                onChange?.(range);
                if (range.start && range.end) {
                  setOpen(false);
                }
              }}
            />
            <div className="px-4 pb-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange?.({ start: null, end: null });
                  setOpen(false);
                }}
              >
                Kosongkan tanggal
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
