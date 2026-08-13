"use client";

import DatePicker from "@/components/shared/date-picker-old/date-picker";
import { formatDate } from "@/lib/utils";
import { forwardRef, useState } from "react";
import Input from "./input";

type Props = {
  label?: string;
  value?: Date;
  onChange?: (val: Date) => void;
  error?: string;
};

const InputDate = forwardRef<HTMLInputElement, Props>(
  ({ label = "Date", value, onChange, error }, ref) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Input
          ref={ref}
          label={label}
          value={formatDate(value)}
          readOnly
          error={error} // 🔥 inject error ke input
          onFocus={() => setOpen(true)}
        />

        {open && (
          <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={() => setOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <DatePicker
                classname="shadow-xl"
                value={value}
                onChange={(date: Date) => {
                  onChange?.(date);
                  setOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  },
);

InputDate.displayName = "InputDate";

export default InputDate;
