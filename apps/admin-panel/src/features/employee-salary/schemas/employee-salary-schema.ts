import z from "zod/v3";

const EmployeeRefSchema = z.object({
  id: z.string(),
  employee_number: z.string().optional(),
  fullname: z.string().optional(),
});

export const EmployeeSalarySchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  basic_salary: z.number(),
  effective_date: z.number(),
  end_date: z.number().nullable().optional(),
  created_at: z.number(),
  updated_at: z.number(),
  employee: EmployeeRefSchema.optional(),
});

export const CreateEmployeeSalarySchema = z.object({
  employee_id: z.string().min(1),
  basic_salary: z.coerce.number().min(0, "Gaji pokok tidak boleh negatif"),
  effective_date: z.string().min(1, "Tanggal berlaku wajib diisi"),
  end_date: z.string().optional(),
});

export const UpdateEmployeeSalarySchema = z.object({
  basic_salary: z.coerce.number().min(0, "Gaji pokok tidak boleh negatif").optional(),
  effective_date: z.string().min(1, "Tanggal berlaku wajib diisi").optional(),
  end_date: z.string().optional(),
});

export const SearchEmployeeSalaryRequestSchema = z.object({
  employee_id: z.string().optional(),
  active_only: z.boolean().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type EmployeeSalary = z.infer<typeof EmployeeSalarySchema>;
export type CreateEmployeeSalary = z.infer<typeof CreateEmployeeSalarySchema>;
export type UpdateEmployeeSalary = z.infer<typeof UpdateEmployeeSalarySchema>;
export type SearchEmployeeSalaryRequest = z.infer<
  typeof SearchEmployeeSalaryRequestSchema
>;
