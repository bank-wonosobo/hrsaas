import z from "zod/v3";

export const WEEKDAY_LABELS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export const ShiftEmployeeSchema = z.object({
  id: z.string(),
  fullname: z.string(),
  employee_number: z.string(),
});

export const ShiftSchema = z.object({
  id: z.string(),
  name: z.string(),
  late_tolerance: z.number(),
  employees: z.array(ShiftEmployeeSchema).optional(),
  created_at: z.number(),
  updated_at: z.number(),
});

export const SearchShiftRequestSchema = z.object({
  key: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const ShiftDayRequestSchema = z.object({
  weekday: z.number().min(1).max(7),
  day_type: z.enum(["workday", "offday"]),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  break_start: z.string().optional(),
  break_end: z.string().optional(),
  max_break_minutes: z.coerce.number().min(0).default(0),
});

export const CreateShiftSchema = z.object({
  name: z.string().min(1, "Nama shift wajib diisi"),
  late_tolerance: z.coerce
    .number()
    .min(0, "Toleransi tidak boleh negatif")
    .default(0),
  shift_days: z.array(ShiftDayRequestSchema),
});

export const DEFAULT_SHIFT_DAYS = [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
  weekday,
  day_type: weekday <= 5 ? ("workday" as const) : ("offday" as const),
  check_in: weekday <= 5 ? "07:45" : "",
  check_out: weekday <= 5 ? "17:00" : "",
  break_start: weekday <= 5 ? "12:00" : "",
  break_end: weekday <= 5 ? "13:00" : "",
  max_break_minutes: weekday <= 5 ? 60 : 0,
}));

export type Shift = z.infer<typeof ShiftSchema>;
export type ShiftEmployee = z.infer<typeof ShiftEmployeeSchema>;
export type SearchShiftRequest = z.infer<typeof SearchShiftRequestSchema>;
export type ShiftDayRequest = z.infer<typeof ShiftDayRequestSchema>;
export type CreateShift = z.infer<typeof CreateShiftSchema>;
