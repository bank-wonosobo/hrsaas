import DateRangePicker from "@/components/shared/date-picker-old/date-range-picker";
import { useState } from "react";
import Input from "./input";

interface Props {
  value?: {
    start: Date | null;
    end: Date | null;
  };
  onChange?: (val: { start: Date | null; end: Date | null }) => void;
}

export default function InputDateRangeDual({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [activeField, setActiveField] = useState<"start" | "end">("start");

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="flex gap-2 items-center">
      {/* START */}
      <Input
        label="Start Date"
        value={formatDate(value?.start)}
        readOnly
        onFocus={() => {
          setActiveField("start");
          setOpen(true);
        }}
      />

      <span>-</span>
      {/* END */}
      <Input
        label="End Date"
        value={formatDate(value?.end)}
        readOnly
        onFocus={() => {
          setActiveField("end");
          setOpen(true);
        }}
      />

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-999 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <DateRangePicker
              value={value}
              onChange={(range) => {
                let newRange = { ...range };

                // 🔥 kontrol berdasarkan input aktif
                if (activeField === "start") {
                  newRange = {
                    start: range.start,
                    end: range.end,
                  };
                }

                if (activeField === "end") {
                  newRange = {
                    start: range.start,
                    end: range.end,
                  };
                }

                onChange?.(newRange);

                // auto close kalau lengkap
                if (newRange.start && newRange.end) {
                  setOpen(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
