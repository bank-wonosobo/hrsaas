import z from "zod/v3";

export const EmployeeDocumentSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  doc_type: z.string(),
  doc_name: z.string(),
  doc_number: z.string(),
  file_url: z.string(),
  issued: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
});

export const CreateEmployeeDocumentSchema = z.object({
  employee_id: z.string().min(1),
  doc_type: z.string().min(1, "Tipe dokumen wajib diisi"),
  doc_name: z.string().min(1, "Nama dokumen wajib diisi"),
  doc_number: z.string().min(1, "Nomor dokumen wajib diisi"),
  issued: z.string().min(1, "Tanggal terbit wajib diisi"),
  file_url: z.string().min(1, "URL file wajib diisi"),
});

export const SearchEmployeeDocumentSchema = z.object({
  employee_id: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type EmployeeDocument = z.infer<typeof EmployeeDocumentSchema>;
export type CreateEmployeeDocument = z.infer<typeof CreateEmployeeDocumentSchema>;
export type SearchEmployeeDocument = z.infer<typeof SearchEmployeeDocumentSchema>;
