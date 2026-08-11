import z from "zod/v3";

export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
});

export const SearchPermissionRequestSchema = z.object({
  key: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const CreatePermissionSchema = z.object({
  name: z.string().min(1, "Nama permission wajib diisi"),
});

export type Permission = z.infer<typeof PermissionSchema>;
export type SearchPermissionRequest = z.infer<typeof SearchPermissionRequestSchema>;
export type CreatePermission = z.infer<typeof CreatePermissionSchema>;
