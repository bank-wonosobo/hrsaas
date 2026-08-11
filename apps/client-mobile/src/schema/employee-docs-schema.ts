import z from "zod/v3";

export const EmployeeDocumentSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  doc_type: z.string(),
  doc_number: z.string().nullable().optional(),
  doc_name: z.string(),
  file_url: z.string(),
  issued: z.number().nullable().optional(),
  created_at: z.number(),
  updated_at: z.number(),
});

export type EmployeeDocument = z.infer<typeof EmployeeDocumentSchema>;

export const SearchEmployeeDocumentSchema = z.object({
  employee_id: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type SearchEmployeeDocument = z.infer<
  typeof SearchEmployeeDocumentSchema
>;
