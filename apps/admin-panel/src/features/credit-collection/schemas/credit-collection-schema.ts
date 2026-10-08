import z from "zod/v3";

export const CreditCollectionLoanSchema = z.object({
  nasabah_id: z.string(),
  nasabah_name: z.string(),
  no_pjm: z.string(),
  loan_type: z.string(),
  unit: z.string(),
  collectibility: z.string(),
  loan_limit: z.number(),
  outstanding_balance: z.number(),
  overdue_principal: z.number(),
  overdue_interest: z.number(),
  overdue_total: z.number(),
  overdue_principal_frequency: z.number(),
  overdue_interest_frequency: z.number(),
  overdue_principal_days: z.number(),
  overdue_interest_days: z.number(),
  loan_status: z.string(),
});

export const CreditCollectionSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  employee_name: z.string().optional(),
  img_url: z.string(),
  lat: z.string(),
  lng: z.string(),
  pinjaman: CreditCollectionLoanSchema,
  total_paid: z.number(),
  commitment: z.string(),
  created_at: z.number(),
});

export const SearchCreditCollectionSchema = z.object({
  employee_id: z.string().optional(),
  nasabah_name: z.string().optional(),
  no_pjm: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type CreditCollection = z.infer<typeof CreditCollectionSchema>;
export type SearchCreditCollectionRequest = z.infer<
  typeof SearchCreditCollectionSchema
>;
