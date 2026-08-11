import z from "zod/v3";

export const OfficeLocationSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  radius_meters: z.number(),
  is_active: z.boolean(),
  created_at: z.number(),
  updated_at: z.number(),
});

export type OfficeLocation = z.infer<typeof OfficeLocationSchema>;
