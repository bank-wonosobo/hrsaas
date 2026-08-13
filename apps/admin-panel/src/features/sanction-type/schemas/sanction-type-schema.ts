import z from "zod/v3";

export const SanctionTypeSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  name: z.string(),
  description: z.string(),
  note: z.string(),
  created_at: z.number(),
  updated_at: z.number(),
});

export const SearchSanctionTypeRequestSchema = z.object({
  key: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const CreateSanctionTypeSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  note: z.string().optional().default(""),
});

export type SanctionType = z.infer<typeof SanctionTypeSchema>;
export type SearchSanctionTypeRequest = z.infer<typeof SearchSanctionTypeRequestSchema>;
export type CreateSanctionType = z.infer<typeof CreateSanctionTypeSchema>;
