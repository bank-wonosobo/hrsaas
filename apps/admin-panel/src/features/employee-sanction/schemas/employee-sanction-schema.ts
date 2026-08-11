import { EmployeeSchema } from "@/features/employee/schemas/employee-schema";
import { SanctionTypeSchema } from "@/features/sanction-type/schemas/sanction-type-schema";
import z from "zod/v3";

export const EmployeeSanctionSchema = z.object({
  id: z.string(),
  employee: EmployeeSchema,
  sanction: SanctionTypeSchema,
  reason: z.string(),
  start_date: z.number(),
  end_date: z.number(),
  document_url: z.string(),
});

export const CreateEmployeeSanctionSchema = z.object({
  employee_id: z.string(),
  sanction_id: z.string(),
  reason: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  document_url: z.string(),
});

export const SearchEmployeeSanctionRequestSchema = z.object({
  employee_id: z.string().optional(),
  sanction_id: z.string().optional(),
  reason: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.boolean().optional(),
  size: z.number().optional(),
  page: z.number().optional(),
});

export type SanctionType = z.infer<typeof SanctionTypeSchema>;
export type EmployeeSanction = z.infer<typeof EmployeeSanctionSchema>;
export type CreateEmployeeSanction = z.infer<
  typeof CreateEmployeeSanctionSchema
>;
export type SearchEmployeeSanctionRequest = z.infer<
  typeof SearchEmployeeSanctionRequestSchema
>;
