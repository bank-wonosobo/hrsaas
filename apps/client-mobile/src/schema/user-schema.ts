import { EmployeeSchema } from "@/features/employee/employee-schema";
import z from "zod/v3";

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
  image_url: z.string(),
  created_at: z.number(),
  updated_at: z.number(),
  employee: EmployeeSchema.optional(),
});

export type Role = z.infer<typeof RoleSchema>;
export type User = z.infer<typeof UserSchema>;

export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Password saat ini wajib diisi"),
    new_password: z.string().min(8, "Password baru minimal 8 karakter"),
    confirm_password: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Konfirmasi password tidak sama",
    path: ["confirm_password"],
  });

export type ChangePasswordForm = z.infer<typeof ChangePasswordSchema>;

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
};
