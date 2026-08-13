"use client";

import Button from "@/components/ui/button/button";
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
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

interface Props {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
}

const days = ["Min", "Sn", "Sl", "R", "Km", "J", "Sb"];

export default function DateRangePicker({
  value,
  onChange,
}: Props): React.ReactNode {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(value?.start ?? null);
  const [endDate, setEndDate] = useState<Date | null>(value?.end ?? null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartDate(value?.start ?? null);
    setEndDate(value?.end ?? null);
  }, [value?.start, value?.end]);

  const handleSelect = (day: Date) => {
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
    onChange?.({ start: newStart, end: newEnd });
  };

  const renderDays = () => (
    <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
      {days.map((day, i) => (
        <div key={i} className="py-1">
          {day}
        </div>
      ))}
    </div>
  );

  const renderCells = (month: Date) => {
    const rows = [];
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDateWeek = startOfWeek(monthStart);
    const endDateWeek = endOfWeek(monthEnd);

    let day = startDateWeek;

    while (day <= endDateWeek) {
      const daysRow = [];

      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const rangeEnd = endDate ?? hoverDate;

        const inRange =
          startDate &&
          rangeEnd &&
          isAfter(cloneDay, startDate) &&
          isBefore(cloneDay, rangeEnd);

        const isStart = startDate && isSameDay(cloneDay, startDate);
        const isEnd = endDate && isSameDay(cloneDay, endDate);

        daysRow.push(
          <div
            key={cloneDay.toString()}
            onClick={() => handleSelect(cloneDay)}
            onMouseEnter={() => setHoverDate(cloneDay)}
            className="h-9 w-9 sm:h-10 sm:w-10 my-0.5 flex items-center justify-center relative cursor-pointer"
          >
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
            <div
              className={clsx(
                "z-10 h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full text-xs sm:text-sm",
                !isSameMonth(cloneDay, monthStart) && "text-gray-300",
                isStart || isEnd
                  ? "bg-black text-white"
                  : "hover:border hover:border-black",
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

    return <div>{rows}</div>;
  };

  const nextMonth = addMonths(currentMonth, 1);

  return (
    <div className="p-4 bg-white rounded-2xl w-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          variant="ghost"
        >
          <ChevronLeft size={18} />
        </Button>

        <div className="flex gap-4 sm:gap-10 text-sm font-medium">
          <span>{format(currentMonth, "MMMM yyyy", { locale: id })}</span>
          <span className="hidden md:block">
            {format(nextMonth, "MMMM yyyy", { locale: id })}
          </span>
        </div>

        <Button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          variant="ghost"
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      {/* Calendars */}
      <div className="flex gap-6">
        <div>
          {renderDays()}
          {renderCells(currentMonth)}
        </div>
        <div className="hidden md:block">
          {renderDays()}
          {renderCells(nextMonth)}
        </div>
      </div>
    </div>
  );
}
