import z from "zod/v3";

export const SALARY_COMPONENT_TYPES = ["EARNING", "DEDUCTION"] as const;
export const CALCULATION_TYPES = [
  "FIXED",
  "PERCENTAGE",
  "FORMULA",
  "MANUAL",
] as const;

export const SalaryComponentSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  type: z.enum(SALARY_COMPONENT_TYPES),
  calculation_type: z.enum(CALCULATION_TYPES),
  is_taxable: z.boolean(),
  is_bpjs_base: z.boolean(),
  is_active: z.boolean(),
  created_at: z.number(),
  updated_at: z.number(),
});

export const CreateSalaryComponentSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  type: z.enum(SALARY_COMPONENT_TYPES, {
    errorMap: () => ({ message: "Tipe wajib dipilih" }),
  }),
  calculation_type: z.enum(CALCULATION_TYPES, {
    errorMap: () => ({ message: "Metode perhitungan wajib dipilih" }),
  }),
  is_taxable: z.boolean().default(false),
  is_bpjs_base: z.boolean().default(false),
});

export const UpdateSalaryComponentSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").optional(),
  type: z.enum(SALARY_COMPONENT_TYPES).optional(),
  calculation_type: z.enum(CALCULATION_TYPES).optional(),
  is_taxable: z.boolean().optional(),
  is_bpjs_base: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const SearchSalaryComponentRequestSchema = z.object({
  key: z.string().optional(),
  type: z.string().optional(),
  active_only: z.boolean().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type SalaryComponent = z.infer<typeof SalaryComponentSchema>;
export type CreateSalaryComponent = z.infer<typeof CreateSalaryComponentSchema>;
export type UpdateSalaryComponent = z.infer<typeof UpdateSalaryComponentSchema>;
export type SearchSalaryComponentRequest = z.infer<
  typeof SearchSalaryComponentRequestSchema
>;
