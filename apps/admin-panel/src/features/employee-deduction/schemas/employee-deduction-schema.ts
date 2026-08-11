import { SalaryComponentSchema } from "@/features/salary-component/schemas/salary-component-schema";
import z from "zod/v3";

const EmployeeRefSchema = z.object({
  id: z.string(),
  employee_number: z.string().optional(),
  fullname: z.string().optional(),
});

export const EmployeeDeductionSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  salary_component_id: z.string(),
  amount: z.number(),
  percentage: z.number(),
  effective_date: z.number(),
  end_date: z.number().nullable().optional(),
  created_at: z.number(),
  updated_at: z.number(),
  employee: EmployeeRefSchema.optional(),
  salary_component: SalaryComponentSchema.optional(),
});

export const CreateEmployeeDeductionSchema = z.object({
  employee_id: z.string().min(1),
  salary_component_id: z.string().min(1, "Komponen wajib dipilih"),
  amount: z.coerce.number().min(0).optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
  effective_date: z.string().min(1, "Tanggal berlaku wajib diisi"),
  end_date: z.string().optional(),
});

export const UpdateEmployeeDeductionSchema = z.object({
  amount: z.coerce.number().min(0).optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
  effective_date: z.string().min(1, "Tanggal berlaku wajib diisi").optional(),
  end_date: z.string().optional(),
});

export const SearchEmployeeDeductionRequestSchema = z.object({
  employee_id: z.string().optional(),
  active_only: z.boolean().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type EmployeeDeduction = z.infer<typeof EmployeeDeductionSchema>;
export type CreateEmployeeDeduction = z.infer<typeof CreateEmployeeDeductionSchema>;
export type UpdateEmployeeDeduction = z.infer<typeof UpdateEmployeeDeductionSchema>;
export type SearchEmployeeDeductionRequest = z.infer<
  typeof SearchEmployeeDeductionRequestSchema
>;
