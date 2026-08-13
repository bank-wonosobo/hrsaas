import { TimeOffTypeSchema } from "@/features/time-off-type/schemas/time-off-type-schema";
import z from "zod/v3";

const TimeOffBalanceEmployeeSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  user_id: z.string(),
  employee_number: z.string(),
  fullname: z.string(),
  birth_place: z.string(),
  birth_date: z.number(),
  blood_type: z.string(),
  marital_status: z.string(),
  religion: z.string(),
  phone: z.string(),
  timezone: z.string(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
});

export const TimeOffBalanceSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  time_off_type_id: z.string(),
  period_year: z.number(),
  entitled_days: z.number(),
  used_days: z.number(),
  remaining_days: z.number(),
  employee: TimeOffBalanceEmployeeSchema,
  time_off_type: TimeOffTypeSchema,
});

export const CreateTimeOffBalanceSchema = z.object({
  employee_id: z.string().min(1),
  time_off_type_id: z.string().min(1, "Jenis cuti wajib dipilih"),
  period_year: z.coerce.number().min(2000),
  entitled_days: z.coerce.number().min(0, "Hak cuti minimal 0"),
  used_days: z.coerce.number().min(0, "Cuti terpakai minimal 0"),
});

export const SearchTimeOffBalanceSchema = z.object({
  employee_id: z.string().optional(),
  time_off_type_id: z.string().optional(),
  period_year: z.number().optional(),
});

export type TimeOffBalance = z.infer<typeof TimeOffBalanceSchema>;
export type CreateTimeOffBalance = z.infer<typeof CreateTimeOffBalanceSchema>;
export type SearchTimeOffBalance = z.infer<typeof SearchTimeOffBalanceSchema>;
