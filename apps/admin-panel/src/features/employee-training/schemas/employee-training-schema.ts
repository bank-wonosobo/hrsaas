import z from "zod/v3";

export const EmployeeTrainingSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  training_name: z.string(),
  organizer: z.string(),
  start_date: z.number(),
  end_date: z.number().nullable().optional(),
  certificate_url: z.string().nullable().optional(),
});

export const CreateEmployeeTrainingSchema = z.object({
  employee_id: z.string().min(1),
  training_name: z.string().min(1, "Nama training wajib diisi"),
  organizer: z.string().min(1, "Penyelenggara wajib diisi"),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
  end_date: z.string().optional(),
  certificate_url: z.string().optional(),
});

export const UpdateEmployeeTrainingSchema = z.object({
  training_name: z.string().min(1, "Nama training wajib diisi"),
  organizer: z.string().min(1, "Penyelenggara wajib diisi"),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
  end_date: z.string().optional(),
  certificate_url: z.string().optional(),
});

export const SearchEmployeeTrainingSchema = z.object({
  employee_id: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type EmployeeTraining = z.infer<typeof EmployeeTrainingSchema>;
export type CreateEmployeeTraining = z.infer<typeof CreateEmployeeTrainingSchema>;
export type UpdateEmployeeTraining = z.infer<typeof UpdateEmployeeTrainingSchema>;
export type SearchEmployeeTraining = z.infer<typeof SearchEmployeeTrainingSchema>;
