import z from "zod/v3";

export const EmployeeEducationSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  education_level: z.string(),
  institution_name: z.string(),
  major: z.string(),
  graduation_year: z.number(),
  gpa: z.number().nullable().optional(),
  start_year: z.number().nullable().optional(),
  end_year: z.number().nullable().optional(),
});

export type EmployeeEducation = z.infer<typeof EmployeeEducationSchema>;
