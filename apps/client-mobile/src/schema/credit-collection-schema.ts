import z from "zod/v3";

export const CreditCustomerSchema = z.object({
  branch_code: z.string(),
  no_pjm: z.string(),
  nasabah_id: z.string(),
  nasabah_name: z.string(),
  nik: z.string(),
  place_of_birth: z.string(),
  date_of_birth: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
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

export type CreditCustomer = z.infer<typeof CreditCustomerSchema>;

export const CreditCollectionVisitSchema = z.object({
  img_url: z.string().min(1, "Foto wajib diambil"),
  lat: z.string(),
  lng: z.string(),
  total_paid: z.number().optional(),
  commitment: z.string(),
  pinjaman: CreditCustomerSchema,
});

export type CreditCollectionVisit = z.infer<typeof CreditCollectionVisitSchema>;

export const SearchCreditCustomerSchema = z.object({
  kodecabang: z.string(),
  cif: z.string(),
  nama: z.string(),
  nik: z.string(),
  nopjm: z.string(),
});

export type SearchCreditCustomer = z.infer<typeof SearchCreditCustomerSchema>;

export const CreditCollectionVisitRecordSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  employee_name: z.string().optional(),
  img_url: z.string(),
  lat: z.string(),
  lng: z.string(),
  pinjaman: CreditCustomerSchema,
  total_paid: z.number(),
  commitment: z.string(),
  created_at: z.number(),
});

export type CreditCollectionVisitRecord = z.infer<
  typeof CreditCollectionVisitRecordSchema
>;
