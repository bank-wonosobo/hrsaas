import z from "zod/v3";

export const GenerateSignUrlSchema = z.object({
  mime_type: z.string(),
  is_public: z.boolean(),
});

export type GenerateSignUrl = z.infer<typeof GenerateSignUrlSchema>;

export const SignUrlSchema = z.object({
  upload_url: z.string(),
  object_key: z.string(),
  public_url: z.string(),
});

export type SignUrl = z.infer<typeof SignUrlSchema>;
