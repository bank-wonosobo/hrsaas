import { Option } from "@/components/ui/select/select";
import { Position } from "@/features/position/schemas/position-schema";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date?: Date) => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

export function getLevel(position: Position): number {
  let level = 0;
  let current = position.parent;

  while (current) {
    level++;
    current = current.parent;
  }

  return level;
}

export default function toIDDate(date: Date) {
  // Format date for US English in a long style
  const formattedID = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  return formattedID;
}

export function diffDateDetail(start: Date, end: Date) {
  let s = new Date(start);
  let e = new Date(end);

  // pastikan s <= e
  if (s > e) {
    [s, e] = [e, s];
  }

  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();
  let days = e.getDate() - s.getDate();

  // kalau hari negatif → pinjam dari bulan sebelumnya
  if (days < 0) {
    months -= 1;

    const prevMonth = new Date(e.getFullYear(), e.getMonth(), 0);
    days += prevMonth.getDate();
  }

  // kalau bulan negatif → pinjam dari tahun
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export function mapToOptions<T>(
  data: T[],
  getLabel: (item: T) => string,
  getValue: (item: T) => string,
): Option[] {
  return data.map((item) => ({
    label: getLabel(item),
    value: getValue(item),
  }));
}
