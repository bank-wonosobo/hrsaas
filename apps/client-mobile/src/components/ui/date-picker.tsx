import { clsx } from "clsx";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import AppModal from "./modal";

interface Props {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  error?: boolean;
  minDate?: Date | null;
  maxDate?: Date | null;
  clearable?: boolean;
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
const DAY_CELL_WIDTH = "14.28%";

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  error,
  minDate,
  maxDate,
  clearable = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ?? new Date());

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const startWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let index = 0; index < startWeekday; index++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [viewDate]);

  const selectDate = (date: Date) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setViewDate(value ?? new Date());
          setOpen(true);
        }}
        className={clsx(
          "flex-row items-center justify-between rounded-2xl border bg-white px-4 py-3",
          error ? "border-red-500" : "border-gray-200",
        )}
      >
        <Text
          className={clsx(
            "font-poppins-regular",
            value ? "text-text" : "text-gray-400",
          )}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <CalendarDays size={18} color="#9ca3af" />
      </Pressable>

      <AppModal
        visible={open}
        title="Pilih Tanggal"
        onClose={() => setOpen(false)}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            accessibilityLabel="Bulan sebelumnya"
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
            accessibilityLabel="Bulan berikutnya"
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
          {WEEKDAYS.map((weekday) => (
            <View key={weekday} className="flex-1 items-center py-1">
              <Text className="text-xs font-poppins-medium text-gray-400">
                {weekday}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {days.map((day, index) => {
            if (!day) {
              return (
                <View
                  key={`empty-${index}`}
                  style={{ width: DAY_CELL_WIDTH }}
                  className="py-1"
                />
              );
            }

            const disabled =
              (!!minDate && day < minDate) || (!!maxDate && day > maxDate);
            const selected = value ? isSameDay(day, value) : false;

            return (
              <View
                key={day.toISOString()}
                style={{ width: DAY_CELL_WIDTH }}
                className="items-center py-1"
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={formatDate(day)}
                  accessibilityState={{ selected, disabled }}
                  disabled={disabled}
                  onPress={() => selectDate(day)}
                  className={clsx(
                    "h-9 w-9 items-center justify-center rounded-full",
                    selected && "bg-primary",
                  )}
                >
                  <Text
                    className={clsx(
                      "font-poppins-regular text-sm",
                      disabled && "text-gray-300",
                      selected && "text-white font-poppins-semibold",
                      !disabled && !selected && "text-text",
                    )}
                  >
                    {day.getDate()}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {clearable && (
          <Pressable
            onPress={() => {
              onChange(null);
              setOpen(false);
            }}
            className="mt-4 items-center rounded-full border border-gray-200 py-3"
          >
            <Text className="font-poppins-medium text-sm text-gray-500">
              Hapus tanggal
            </Text>
          </Pressable>
        )}
      </AppModal>
    </>
  );
}
