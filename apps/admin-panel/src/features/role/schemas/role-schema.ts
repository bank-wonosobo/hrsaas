import z from "zod/v3";

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  permissions: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
});

export const SearchRoleRequestSchema = z.object({
  key: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const CreateRoleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi"),
});

export type Role = z.infer<typeof RoleSchema>;
export type SearchRoleRequest = z.infer<typeof SearchRoleRequestSchema>;
export type CreateRole = z.infer<typeof CreateRoleSchema>;
