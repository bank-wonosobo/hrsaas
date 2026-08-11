import z from "zod/v3";

export const DetailVisitSchema = z.object({
  id: z.string(),
  visit_type: z.string(),
  visit_at: z.string(),
  date_visit: z.string(),
  file_url: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  address: z.string(),
  note: z.string(),
  visit_id: z.string(),
  created_at: z.number(),
});

export const VisitSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  date: z.string(),
  client_name: z.string(),
  created_at: z.number(),
  details: z.array(DetailVisitSchema),
});

export const SearchVisitSchema = z.object({
  employee_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  sort_by: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type DetailVisit = z.infer<typeof DetailVisitSchema>;
export type Visit = z.infer<typeof VisitSchema>;
export type SearchVisitRequest = z.infer<typeof SearchVisitSchema>;
