import z from "zod/v3";

export const PAYROLL_STATUSES = [
  "DRAFT",
  "CALCULATED",
  "SUBMITTED",
  "APPROVED",
  "PAID",
  "CANCELLED",
] as const;

export const ADJUSTMENT_TYPES = [
  "BONUS",
  "THR",
  "JASPROD",
  "INCENTIVE",
  "CORRECTION",
] as const;

export const PAYMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
] as const;

export const PayrollEmployeeSummarySchema = z.object({
  id: z.string(),
  employee_number: z.string().optional(),
  fullname: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
});

export const PayrollItemSchema = z.object({
  id: z.string(),
  payroll_detail_id: z.string(),
  salary_component_id: z.string().nullable().optional(),
  name: z.string(),
  type: z.enum(["EARNING", "DEDUCTION"]),
  amount: z.number(),
  calculation_value: z.number().nullable().optional(),
  created_at: z.number(),
});

export const PayrollAdjustmentSchema = z.object({
  id: z.string(),
  payroll_detail_id: z.string(),
  type: z.enum(ADJUSTMENT_TYPES),
  name: z.string(),
  amount: z.number(),
  description: z.string().nullable().optional(),
  created_at: z.number(),
});

export const PayrollDetailSchema = z.object({
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
  employee: PayrollEmployeeSummarySchema.optional(),
  items: z.array(PayrollItemSchema).optional(),
  adjustments: z.array(PayrollAdjustmentSchema).optional(),
});

export const PayrollSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  payroll_number: z.string(),
  period_month: z.number(),
  period_year: z.number(),
  payment_date: z.number().nullable().optional(),
  status: z.enum(PAYROLL_STATUSES),
  total_gross: z.number(),
  total_deduction: z.number(),
  total_net: z.number(),
  created_by: z.string().nullable().optional(),
  approved_by: z.string().nullable().optional(),
  approved_at: z.number().nullable().optional(),
  created_at: z.number(),
  updated_at: z.number(),
  details: z.array(PayrollDetailSchema).optional(),
});

export const PayrollApprovalSchema = z.object({
  id: z.string(),
  payroll_id: z.string(),
  approver_id: z.string(),
  level: z.number(),
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().nullable().optional(),
  approved_at: z.number().nullable().optional(),
  created_at: z.number(),
});

export const PayrollPaymentSchema = z.object({
  id: z.string(),
  payroll_detail_id: z.string(),
  employee_id: z.string(),
  bank_name: z.string().nullable().optional(),
  bank_account: z.string().nullable().optional(),
  account_name: z.string().nullable().optional(),
  amount: z.number(),
  payment_reference: z.string().nullable().optional(),
  paid_at: z.number().nullable().optional(),
  status: z.enum(PAYMENT_STATUSES),
  created_at: z.number(),
  updated_at: z.number(),
});

export const CreatePayrollSchema = z.object({
  period_month: z.coerce.number().min(1).max(12),
  period_year: z.coerce.number().min(2000).max(2100),
});

export const SearchPayrollRequestSchema = z.object({
  status: z.string().optional(),
  period_year: z.number().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const RejectPayrollSchema = z.object({
  notes: z.string().min(1, "Catatan penolakan wajib diisi"),
});

export const CreatePayrollAdjustmentSchema = z.object({
  type: z.enum(ADJUSTMENT_TYPES, {
    errorMap: () => ({ message: "Jenis penyesuaian wajib dipilih" }),
  }),
  name: z.string().min(1, "Nama wajib diisi"),
  amount: z.coerce.number({ invalid_type_error: "Nominal wajib diisi" }),
  description: z.string().optional(),
});

export const UpdatePayrollPaymentStatusSchema = z.object({
  status: z.enum(PAYMENT_STATUSES, {
    errorMap: () => ({ message: "Status wajib dipilih" }),
  }),
  payment_reference: z.string().optional(),
});

export const SearchPayrollPaymentRequestSchema = z.object({
  payroll_id: z.string().optional(),
  status: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type Payroll = z.infer<typeof PayrollSchema>;
export type PayrollDetail = z.infer<typeof PayrollDetailSchema>;
export type PayrollItem = z.infer<typeof PayrollItemSchema>;
export type PayrollAdjustment = z.infer<typeof PayrollAdjustmentSchema>;
export type PayrollApproval = z.infer<typeof PayrollApprovalSchema>;
export type PayrollPayment = z.infer<typeof PayrollPaymentSchema>;
export type CreatePayroll = z.infer<typeof CreatePayrollSchema>;
export type SearchPayrollRequest = z.infer<typeof SearchPayrollRequestSchema>;
export type RejectPayroll = z.infer<typeof RejectPayrollSchema>;
export type CreatePayrollAdjustment = z.infer<typeof CreatePayrollAdjustmentSchema>;
export type UpdatePayrollPaymentStatus = z.infer<
  typeof UpdatePayrollPaymentStatusSchema
>;
export type SearchPayrollPaymentRequest = z.infer<
  typeof SearchPayrollPaymentRequestSchema
>;
