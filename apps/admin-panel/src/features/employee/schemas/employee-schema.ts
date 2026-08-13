import { UserSchema } from "@/features/user/schemas/auth-schema";
import { EmployeeContractSchema } from "@/features/employee-contract/schemas/employee-contract-schema";
import { EmployeeDocumentSchema } from "@/features/employee-docs/schemas/employee-docs-schema";

import z from "zod/v3";

export const DivisionSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  name: z.string(),
  description: z.string(),
});

export const PositionSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_approver: z.boolean(),
  company_id: z.string(),
});

export const EmployeeEducationSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  education_level: z.string(),
  institution_name: z.string(),
  major: z.string(),
  graduation_year: z.number().int(),
  gpa: z.number().optional(),
  start_year: z.number().int().optional(),
  end_year: z.number().int().optional(),
});

export const EmployeeTrainingSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  training_name: z.string(),
  organizer: z.string(),
  start_date: z.number().int(),
  end_date: z.number().int().optional(),
  certificate_url: z.string().optional(),
});

export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  user_id: z.string().uuid(),
  employee_number: z.string().max(20),
  fullname: z.string().min(2).max(100),
  gender: z.string().optional(),
  birth_place: z.string().max(100),
  birth_date: z.number().int(),
  identity_number: z.string().optional(),
  blood_type: z.string().max(10),
  marital_status: z.string().max(20),
  religion: z.string().max(50),
  phone: z.string().max(20),
  address: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().max(10),
  contracts: z.array(EmployeeContractSchema).optional(),
  employee_docs: z.array(EmployeeDocumentSchema).optional(),
  employee_educations: z.array(EmployeeEducationSchema).optional(),
  employee_trainings: z.array(EmployeeTrainingSchema).optional(),
  user: UserSchema,
  is_active: z.boolean().optional(),
  created_at: z.number().int().optional(),
  updated_at: z.number().int().optional(),
});

export const CreateEmployeeScheme = z.object({
  employee_number: z.string().min(1),
  fullname: z.string().min(1),
  gender: z.string().min(1),
  email: z.string().min(1),
  password: z.string().min(1),
  birth_place: z.string().min(1),
  birth_date: z.string().min(1),
  identity_number: z.string().min(1),
  blood_type: z.string().min(1),
  marital_status: z.string().min(1),
  religion: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  timezone: z.string().min(1),
});

export const SearchEmployeeRequestSchema = z.object({
  key: z.string().optional(),
  type: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const UpdateEmployeeSchema = z.object({
  fullname: z.string().min(2).max(100).optional(),
  gender: z.string().optional(),
  birth_place: z.string().max(100).optional(),
  birth_date: z.string().optional(),
  identity_number: z.string().optional(),
  blood_type: z.string().max(10).optional(),
  marital_status: z.string().max(20).optional(),
  religion: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().max(10).optional(),
  is_active: z.boolean().optional(),
});

export type Employee = z.infer<typeof EmployeeSchema>;
export type CreateEmployee = z.infer<typeof CreateEmployeeScheme>;
export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
export type SearchEmployeeRequest = z.infer<typeof SearchEmployeeRequestSchema>;
export type EmployeeContact = z.infer<typeof EmployeeContractSchema>;
export type EmployeeEducation = z.infer<typeof EmployeeEducationSchema>;
export type EmployeeTraining = z.infer<typeof EmployeeTrainingSchema>;
export type position = z.infer<typeof PositionSchema>;
export type division = z.infer<typeof DivisionSchema>;
