import z from "zod/v3";

export const DetailVisitSchema = z.object({
  id: z.string(),
  visit_type: z.string(),
  visit_at: z.string(),
  date_visit: z.string(),
  file_url: z.string().nullable().optional(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  visit_id: z.string(),
  created_at: z.number(),
});

export type DetailVisit = z.infer<typeof DetailVisitSchema>;

export const VisitSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  date: z.string(),
  client_name: z.string(),
  created_at: z.number(),
  details: z.array(DetailVisitSchema),
});

export type Visit = z.infer<typeof VisitSchema>;

export const VisitFormSchema = z.object({
  visit_type: z.enum(["IN", "OUT"]),
  client_name: z.string().min(1, "Nama client wajib diisi"),
  note: z.string().min(1, "Catatan kunjungan wajib diisi"),
});

export type VisitForm = z.infer<typeof VisitFormSchema>;

export const CreateVisitRequestSchema = z.object({
  visit_type: z.enum(["IN", "OUT"]),
  client_name: z.string().min(1),
  note: z.string().min(1),
  latitude: z.string().min(1),
  longitude: z.string().min(1),
  address: z.string().min(1),
  file_url: z.string().min(1),
});

export type CreateVisitRequest = z.infer<typeof CreateVisitRequestSchema>;
