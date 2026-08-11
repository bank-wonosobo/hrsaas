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

export type EmployeeTraining = z.infer<typeof EmployeeTrainingSchema>;
