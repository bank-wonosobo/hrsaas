import z from "zod/v3";
import { UserSchema } from "./user-schema";

export const AuthSchema = z.object({
  user: UserSchema,
  token: z.string().min(10, "Token tidak ada"),
});

export const SignInRequestSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(4, "Minimal 4 karakter"),
});

export type Auth = z.infer<typeof AuthSchema>;
export type SignInRequest = z.infer<typeof SignInRequestSchema>;
