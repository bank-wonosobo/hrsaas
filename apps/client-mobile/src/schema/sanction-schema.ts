import z from "zod/v3";

export const SanctionTypeSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  level: z.number().optional(),
  note: z.string().nullable().optional(),
  created_at: z.number(),
  updated_at: z.number(),
});

export type SanctionType = z.infer<typeof SanctionTypeSchema>;

const SanctionEmployeeSchema = z.object({
  id: z.string(),
  employee_number: z.string(),
  fullname: z.string(),
  phone: z.string().optional(),
  gender: z.string().optional(),
});

export const EmployeeSanctionSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  sanction_id: z.string(),
  reason: z.string().nullable().optional(),
  start_date: z.number(),
  end_date: z.number().nullable().optional(),
  status: z.string().optional(),
  document_url: z.string().nullable().optional(),
  employee: SanctionEmployeeSchema,
  sanction: SanctionTypeSchema,
  created_at: z.number(),
  updated_at: z.number(),
});

export type EmployeeSanction = z.infer<typeof EmployeeSanctionSchema>;

export const SearchEmployeeSanctionSchema = z.object({
  sanction_id: z.string().optional(),
  reason: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type SearchEmployeeSanction = z.infer<
  typeof SearchEmployeeSanctionSchema
>;
