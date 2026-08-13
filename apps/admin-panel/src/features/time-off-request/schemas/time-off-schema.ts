import { EmployeeSchema } from "@/features/employee/schemas/employee-schema";
import { TimeOffTypeSchema } from "@/features/time-off-type/schemas/time-off-type-schema";
import z from "zod/v3";

export const Approvals = z.object({
  employee_name: z.string(),
  is_required: z.boolean(),
  status: z.string(),
  action_at: z.number(),
  action_reason: z.string(),
});

export const TimeOffRequestSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  time_off_type_id: z.string(),
  start_date: z.number(),
  end_date: z.number(),
  requested_days: z.number(),
  request_reason: z.string(),
  request_status: z.string(),
  file_url: z.string().nullable().optional(),
  created_at: z.number(),
  employee: EmployeeSchema,
  time_off_type: TimeOffTypeSchema,
  approvals: z.array(Approvals),
});

export const SearchTimeOffRequestSchema = z.object({
  employee_id: z.string().optional(),
  time_off_type_id: z.string().optional(),
  request_status: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const CreateTimeOffRequestSchema = z.object({
  employee_id: z.string().min(1, "Karyawan wajib dipilih"),
  time_off_type_id: z.string().min(1, "Jenis cuti wajib dipilih"),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
  end_date: z.string().min(1, "Tanggal selesai wajib diisi"),
  request_reason: z.string().min(1, "Alasan wajib diisi"),
  file_url: z.string().optional(),
});

export type SearchTimeOffRequest = z.infer<typeof SearchTimeOffRequestSchema>;
export type TimeOffRequest = z.infer<typeof TimeOffRequestSchema>;
export type CreateTimeOffRequest = z.infer<typeof CreateTimeOffRequestSchema>;
