import z from "zod/v3";

export const SalaryItemSchema = z.object({
  id: z.string(),
  payroll_detail_id: z.string(),
  salary_component_id: z.string().optional(),
  name: z.string(),
  type: z.string(),
  amount: z.number(),
  calculation_value: z.number().optional(),
  created_at: z.number(),
});

export const SalaryAdjustmentSchema = z.object({
  id: z.string(),
  payroll_detail_id: z.string(),
  type: z.string(),
  name: z.string(),
  amount: z.number(),
  description: z.string().nullable().optional(),
  created_at: z.number(),
});

export const SalarySchema = z.object({
  id: z.string(),
  payroll_id: z.string(),
  employee_id: z.string(),
  basic_salary: z.number(),
  gross_salary: z.number(),
  total_earning: z.number(),
  total_deduction: z.number(),
  net_salary: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
  employee: z
    .object({
      id: z.string(),
      employee_number: z.string().optional(),
      fullname: z.string().optional(),
    })
    .optional(),
  items: z.array(SalaryItemSchema).optional(),
  adjustments: z.array(SalaryAdjustmentSchema).optional(),
});

export type SalaryItem = z.infer<typeof SalaryItemSchema>;
export type SalaryAdjustment = z.infer<typeof SalaryAdjustmentSchema>;
export type Salary = z.infer<typeof SalarySchema>;
