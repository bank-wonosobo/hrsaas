import z from "zod/v3";

export const TimeOffTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  is_quota_based: z.boolean(),
  default_quota_days: z.number(),
});

export type TimeOffType = z.infer<typeof TimeOffTypeSchema>;

export const TimeOffBalanceSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  time_off_type_id: z.string(),
  period_year: z.number(),
  entitled_days: z.number(),
  used_days: z.number(),
  remaining_days: z.number(),
  time_off_type: TimeOffTypeSchema,
});

export type TimeOffBalance = z.infer<typeof TimeOffBalanceSchema>;

export const ApprovalResponseSchema = z.object({
  employee_name: z.string(),
  is_required: z.boolean(),
  status: z.string(),
  action_at: z.number().optional(),
  action_reason: z.string().nullable().optional(),
});

export type ApprovalResponse = z.infer<typeof ApprovalResponseSchema>;

export const TimeOffRequestSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  time_off_type_id: z.string(),
  start_date: z.number(),
  end_date: z.number().nullable().optional(),
  requested_days: z.number(),
  request_reason: z.string().nullable().optional(),
  request_status: z.string().nullable().optional(),
  created_at: z.number(),
  time_off_type: TimeOffTypeSchema,
  approvals: z.array(ApprovalResponseSchema).optional(),
});

export type TimeOffRequest = z.infer<typeof TimeOffRequestSchema>;

export const CreateTimeOffRequestSchema = z
  .object({
    time_off_type_id: z.string().min(1, "Jenis cuti wajib diisi"),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal mulai wajib diisi"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal selesai wajib diisi"),
    request_reason: z
      .string()
      .min(3, "Alasan minimal 3 karakter")
      .max(255, "Alasan maksimal 255 karakter"),
    file_url: z.string().optional(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
    path: ["end_date"],
  });

export type CreateTimeOffRequest = z.infer<typeof CreateTimeOffRequestSchema>;
