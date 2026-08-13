import z from "zod/v3";

export const OfficeLocationEmployeeSchema = z.object({
  id: z.string(),
  fullname: z.string(),
  employee_number: z.string(),
});

export const OfficeLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  radius_meters: z.number(),
  is_active: z.boolean(),
  employees: z.array(OfficeLocationEmployeeSchema).optional(),
  created_at: z.number(),
  updated_at: z.number(),
});

export const SearchOfficeLocationRequestSchema = z.object({
  key: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const CreateOfficeLocationSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  lat: z.coerce.number({ invalid_type_error: "Latitude harus berupa angka" }),
  lng: z.coerce.number({ invalid_type_error: "Longitude harus berupa angka" }),
  radius: z.coerce
    .number({ invalid_type_error: "Radius harus berupa angka" })
    .min(0, "Radius tidak boleh negatif"),
});

export const UpdateOfficeLocationSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
});

export type OfficeLocation = z.infer<typeof OfficeLocationSchema>;
export type OfficeLocationEmployee = z.infer<typeof OfficeLocationEmployeeSchema>;
export type SearchOfficeLocationRequest = z.infer<typeof SearchOfficeLocationRequestSchema>;
export type CreateOfficeLocation = z.infer<typeof CreateOfficeLocationSchema>;
export type UpdateOfficeLocation = z.infer<typeof UpdateOfficeLocationSchema>;
