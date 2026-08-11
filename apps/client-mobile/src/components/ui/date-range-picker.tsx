import clsx from "clsx";
import { CalendarRange, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import AppModal from "./modal";

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  error?: boolean;
  minDate?: Date;
}

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatShort(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DateRangePicker({
  value,
  onChange,
  placeholder = "Pilih periode cuti",
  error,
  minDate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value.from ?? new Date());

  const min = startOfDay(minDate ?? new Date());

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [viewDate]);

  const handlePickDay = (day: Date) => {
    if (day < min) return;

    if (!value.from || value.to) {
      onChange({ from: day, to: null });
      return;
    }

    if (day < value.from) {
      onChange({ from: day, to: value.from });
      return;
    }

    onChange({ from: value.from, to: day });
  };

  const label =
    value.from && value.to
      ? `${formatShort(value.from)} - ${formatShort(value.to)}`
      : value.from
        ? formatShort(value.from)
        : placeholder;

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
            value.from ? "text-text" : "text-gray-400",
          )}
        >
          {label}
        </Text>
        <CalendarRange size={18} color="#9ca3af" />
      </Pressable>

      <AppModal
        visible={open}
        title="Pilih Periode Cuti"
        onClose={() => setOpen(false)}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() =>
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
              )
            }
            className="p-2 rounded-full bg-gray-50"
          >
            <ChevronLeft size={18} color="#111" />
          </Pressable>
          <Text className="font-poppins-semibold text-text">
            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
          </Text>
          <Pressable
            onPress={() =>
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
              )
            }
            className="p-2 rounded-full bg-gray-50"
          >
            <ChevronRight size={18} color="#111" />
          </Pressable>
        </View>

        <View className="flex-row">
          {WEEKDAYS.map((w) => (
            <View key={w} className="flex-1 items-center py-1">
              <Text className="text-xs font-poppins-medium text-gray-400">
                {w}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {days.map((day, idx) => {
            if (!day) {
              return (
                <View
                  key={`empty-${idx}`}
                  style={{ width: `${100 / 7}%` }}
                  className="py-1"
                />
              );
            }

            const disabled = day < min;
            const isFrom = value.from ? isSameDay(day, value.from) : false;
            const isTo = value.to ? isSameDay(day, value.to) : false;
            const inRange =
              value.from && value.to && day > value.from && day < value.to;

            return (
              <View
                key={day.toISOString()}
                style={{ width: `${100 / 7}%` }}
                className="items-center py-1"
              >
                <Pressable
                  disabled={disabled}
                  onPress={() => handlePickDay(day)}
                  className={clsx(
                    "h-9 w-9 items-center justify-center rounded-full",
                    (isFrom || isTo) && "bg-primary",
                    inRange && "bg-primary/15",
                  )}
                >
                  <Text
                    className={clsx(
                      "font-poppins-regular text-sm",
                      disabled && "text-gray-300",
                      (isFrom || isTo) && "text-white font-poppins-semibold",
                      !disabled && !isFrom && !isTo && "text-text",
                    )}
                  >
                    {day.getDate()}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <Pressable
          onPress={() => setOpen(false)}
          className="mt-4 bg-primary rounded-full py-3 items-center"
        >
          <Text className="text-white font-poppins-semibold">Selesai</Text>
        </Pressable>
      </AppModal>
    </>
  );
}
