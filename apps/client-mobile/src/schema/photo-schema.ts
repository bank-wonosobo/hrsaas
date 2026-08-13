import z from "zod/v3";

export const PhotoResultSchema = z.object({
  uri: z.string(),
  mimeType: z.string(),
});

export type PhotoResult = z.infer<typeof PhotoResultSchema>;
