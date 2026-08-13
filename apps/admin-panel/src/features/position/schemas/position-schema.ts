import z from "zod/v3";

export type Position = {
  id: string;
  name: string;
  is_approver: boolean;
  company_id: string;
  parent?: Position;
};

export const PositionSchema: z.ZodType<Position> = z.object({
  id: z.string(),
  name: z.string(),
  is_approver: z.boolean(),
  company_id: z.string(),

  parent: z.lazy(() => PositionSchema).optional(),
});

export const SearchPositionRequestSchema = z.object({
  key: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const CreatePositionSchema = z.object({
  name: z.string().min(1),
  is_approver: z.boolean(),
  parent_id: z.string().nullable().optional(),
});

// export type Position = z.infer<typeof PositionSchema>;
export type SearchPositionRequest = z.infer<typeof SearchPositionRequestSchema>;
export type CreatePosition = z.infer<typeof CreatePositionSchema>;
