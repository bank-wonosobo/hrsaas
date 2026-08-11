"use client";
import Button from "@/components/ui/button/button";
import clsx from "clsx";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";

interface Props {
  value?: Date;
  onChange?: (date: Date) => void;
}

const days = ["Min", "Sn", "Sl", "R", "Km", "J", "Sb"];

export default function DatePicker({
  value,
  onChange,
}: Props): React.ReactNode {
  const [mode, setMode] = useState<"date" | "month" | "year">("date");
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);

  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // handle select
  const handleSelect = (day: Date) => {
    setSelectedDate(day);
    onChange?.(day);
  };

  // Render header
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <Button
        type="button"
        onClick={() => {
          if (mode === "date") setCurrentMonth(subMonths(currentMonth, 1));
          else if (mode === "month")
            setCurrentMonth(subMonths(currentMonth, 12));
          else if (mode === "year")
            setCurrentMonth(new Date(currentMonth.getFullYear() - 12, 0));
        }}
        variant="ghost"
      >
        <ChevronLeft size={20} />
      </Button>

      <div
        className="font-semibold cursor-pointer"
        onClick={() => {
          if (mode === "date") setMode("month");
          else if (mode === "month") setMode("year");
        }}
      >
        {format(currentMonth, "MMMM yyyy")}
      </div>

      <Button
        type="button"
        onClick={() => {
          if (mode === "date") setCurrentMonth(addMonths(currentMonth, 1));
          else if (mode === "month")
            setCurrentMonth(addMonths(currentMonth, 12));
          else if (mode === "year")
            setCurrentMonth(new Date(currentMonth.getFullYear() + 12, 0));
        }}
        variant="ghost"
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  );

  const renderDays = () => (
    <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-3">
      {days.map((day, i) => (
        <div key={i}>{day}</div>
      ))}
    </div>
  );

  const renderCells = () => {
    const rows = [];
    let day = startDate;

    while (day <= endDate) {
      const daysRow = [];

      for (let i = 0; i < 7; i++) {
        const cloneDay = day;

        daysRow.push(
          <div
            key={day.toString()}
            onClick={() => handleSelect(cloneDay)}
            className={clsx(
              "h-12 w-12 my-0.5 flex text-sm font-medium items-center justify-center cursor-pointer rounded-full",
              !isSameMonth(day, monthStart) && "text-gray-300",
              isSameDay(day, selectedDate || new Date(0)) &&
                "bg-black text-white",
              "hover:border hover:border-gray-900",
            )}
          >
            {format(day, "d")}
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

  const renderMonths = () => {
    const months = Array.from({ length: 12 });

    return (
      <div className="grid grid-cols-3 gap-x-15 gap-y-10">
        {months.map((_, i) => {
          const monthDate = new Date(currentMonth.getFullYear(), i, 1);

          return (
            <div
              key={i}
              onClick={() => {
                setCurrentMonth(monthDate);
                setMode("date");
              }}
              className={clsx(
                "p-2 text-center cursor-pointer rounded-lg hover:bg-gray-100",
                i === currentMonth.getMonth() && "bg-black text-white",
              )}
            >
              {format(monthDate, "MMM")}
            </div>
          );
        })}
      </div>
    );
  };

  const renderYears = () => {
    const year = currentMonth.getFullYear();
    const startYear = year - 6; // range 12 tahun

    return (
      <div className="grid grid-cols-3 gap-x-15 gap-y-10">
        {Array.from({ length: 12 }).map((_, i) => {
          const y = startYear + i;

          return (
            <div
              key={y}
              onClick={() => {
                setCurrentMonth(new Date(y, currentMonth.getMonth(), 1));
                setMode("month");
              }}
              className={clsx(
                "p-2 text-center cursor-pointer rounded-lg hover:bg-gray-100",
                y === year && "bg-black text-white",
              )}
            >
              {y}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-sm  px-6 py-4 bg-white rounded-2xl m-3 shadow-custom-lg">
      {renderHeader()}
      {mode === "date" && (
        <>
          {renderDays()}
          {renderCells()}
        </>
      )}
      {mode === "month" && renderMonths()}
      {mode === "year" && renderYears()}
    </div>
  );
}
