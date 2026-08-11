import { z } from "zod/v3";

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  email_verified: z.boolean().optional(),
  roles: z.array(RoleSchema).optional(),
  permissions: z.array(z.object({ name: z.string() })).optional(),
  company_id: z.string(),
  created_at: z.number(),
  updated_at: z.number(),
});

export const AuthSchema = z.object({
  user: UserSchema,
  token: z.string().min(10, "Token tidak ada"),
});

export const SignInRequestSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(4, "Minimal 4 karakter"),
});

export const SearchUserRequestSchema = z.object({
  key: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const UpdateUserRequestSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong").optional(),
  email: z.string().email("Email tidak valid").optional(),
  email_verified: z.boolean().optional(),
  role_ids: z.array(z.string()).optional(),
});

export const ResetPasswordRequestSchema = z.object({
  new_password: z.string().min(8, "Minimal 8 karakter"),
});

export type User = z.infer<typeof UserSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Auth = z.infer<typeof AuthSchema>;
export type SignInRequest = z.infer<typeof SignInRequestSchema>;
export type SearchUserRequest = z.infer<typeof SearchUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
