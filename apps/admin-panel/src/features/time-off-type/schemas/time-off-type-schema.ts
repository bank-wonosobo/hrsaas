import z from "zod/v3";

export const TimeOffTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  is_quota_based: z.boolean(),
  default_quota_days: z.number(),
});

export const CreateTimeOffTypeSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  category: z.enum(["IZIN", "SAKIT", "CUTI"], {
    errorMap: () => ({ message: "Kategori wajib dipilih" }),
  }),
  is_quota_based: z.boolean().default(false),
  default_quota_days: z.coerce.number().min(0, "Kuota minimal 0"),
});

export const SearchTimeOffTypeRequestSchema = z.object({
  page: z.number().optional(),
  size: z.number().optional(),
});

export type TimeOffType = z.infer<typeof TimeOffTypeSchema>;
export type CreateTimeOffType = z.infer<typeof CreateTimeOffTypeSchema>;
export type SearchTimeOffTypeRequest = z.infer<
  typeof SearchTimeOffTypeRequestSchema
>;
