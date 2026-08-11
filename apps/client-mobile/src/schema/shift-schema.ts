import z from "zod/v3";

export const ShiftDaySchema = z.object({
  weekday: z.number(),
  day_type: z.string(),
  check_in: z.number(),
  check_out: z.number(),
  break_start: z.number(),
  break_end: z.number(),
  max_break_minutes: z.number(),
});

export const ShiftSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  name: z.string(),
  late_tolerance: z.number(),
  shift_days: z.array(ShiftDaySchema),
});

export type ShifDay = z.infer<typeof ShiftDaySchema>;
export type Shift = z.infer<typeof ShiftSchema>;
