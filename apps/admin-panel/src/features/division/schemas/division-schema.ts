import z from "zod/v3";

export const DivisionSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  name: z.string(),
  description: z.string(),
});

export const SearchDivisionRequestSchema = z.object({
  key: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const CreateDivisionSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type Division = z.infer<typeof DivisionSchema>;
export type SearchDivisionRequest = z.infer<typeof SearchDivisionRequestSchema>;
export type CreateDivision = z.infer<typeof CreateDivisionSchema>;
