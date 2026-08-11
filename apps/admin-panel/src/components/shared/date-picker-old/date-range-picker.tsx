import clsx from "clsx";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  value?: {
    start: Date | null;
    end: Date | null;
  };
  onChange?: (range: { start: Date | null; end: Date | null }) => void;
  minDate?: Date;
};

const days = ["Min", "Sn", "Sl", "R", "Km", "J", "Sb"];

const today = new Date();

export default function DateRangePicker({
  onChange,
  minDate = today,
  value,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(value?.start ?? null);
  const [endDate, setEndDate] = useState<Date | null>(value?.end ?? null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  useEffect(() => {
    if (value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStartDate(value.start);
      setEndDate(value.end);
    }
  }, [value]);

  const handleSelect = (day: Date) => {
    if (isBefore(day, subDays(minDate, 1))) return;

    let newStart = startDate;
    let newEnd = endDate;

    if (!startDate || (startDate && endDate)) {
      newStart = day;
      newEnd = null;
    } else {
      if (isBefore(day, startDate)) {
        newStart = day;
      } else {
        newEnd = day;
      }
    }

    setStartDate(newStart);
    setEndDate(newEnd);

    onChange?.({
      start: newStart,
      end: newEnd,
    });
  };

  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDateWeek = startOfWeek(monthStart);
    const endDateWeek = endOfWeek(monthEnd);

    let day = startDateWeek;
    const rows = [];

    while (day <= endDateWeek) {
      const daysRow = [];

      for (let i = 0; i < 7; i++) {
        const cloneDay = day;

        const inRange =
          startDate &&
          (endDate || hoverDate) &&
          isAfter(cloneDay, startDate) &&
          isBefore(cloneDay, ((endDate ?? 0) || hoverDate) ?? 0);

        const isStart = startDate && isSameDay(cloneDay, startDate);
        const isEnd = endDate && isSameDay(cloneDay, endDate);
        const isDisabled = isBefore(cloneDay, subDays(minDate, 1));

        daysRow.push(
          <div
            key={cloneDay.toString()}
            onClick={() => !isDisabled && handleSelect(cloneDay)}
            onMouseEnter={() => !isDisabled && setHoverDate(cloneDay)}
            className={clsx(
              "h-10 w-full flex items-center justify-center text-sm relative cursor-pointer",
              !isSameMonth(cloneDay, monthStart) && "text-gray-300",
              isDisabled && "text-gray-300 line-through cursor-not-allowed",
            )}
          >
            {/* background range FULL */}
            {(inRange || isStart || isEnd) && (
              <div
                className={clsx(
                  "absolute inset-0",
                  inRange && "bg-gray-100",
                  isStart && "bg-gray-100 rounded-l-full",
                  isEnd && "bg-gray-100 rounded-r-full",
                )}
              />
            )}

            {/* circle date */}
            <div
              className={clsx(
                "h-10 w-10 flex items-center justify-center rounded-full z-10",
                isStart || isEnd
                  ? "bg-black text-white"
                  : !isDisabled &&
                      "hover:border hover:border-black hover:bg-gray-100 hover:absolute hover:inset-0",
              )}
            >
              {format(cloneDay, "d")}
            </div>
          </div>,
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {daysRow}
        </div>,
      );
    }

    return (
      <div className="w-full">
        <div className="text-center md:text-left font-semibold mb-2">
          {format(month, "MMMM yyyy")}
        </div>

        <div className="grid grid-cols-7 text-xs text-gray-400 mb-2">
          {days.map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>

        {rows}
      </div>
    );
  };

  return (
    <div className=" rounded-2xl p-2 bg-white w-full">
      {/* header */}
      <div className="flex justify-between mb-4 relative top-10">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft />
        </button>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight />
        </button>
      </div>

      {/* 2 months */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {renderMonth(currentMonth)}

        {/* hanya tampil di desktop */}
        <div className="hidden md:block">
          {renderMonth(addMonths(currentMonth, 1))}
        </div>
      </div>

      {/* footer */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
            onChange?.({ start: null, end: null });
          }}
          className="text-sm underline"
        >
          Kosongkan tanggal
        </button>
      </div>
    </div>
  );
}
