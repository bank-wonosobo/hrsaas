import z from "zod/v3";

export const DivisionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Division = z.infer<typeof DivisionSchema>;

export const PositionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Position = z.infer<typeof PositionSchema>;

export const EmployeeContractSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  contract_type: z.string(),
  start_date: z.number(),
  end_date: z.number().nullable().optional(),
  division_id: z.string(),
  position_id: z.string(),
  employee_status: z.string(),
  salary: z.number(),
  is_active: z.boolean(),
  division: DivisionSchema.optional(),
  position: PositionSchema.optional(),
});

export type EmployeeContract = z.infer<typeof EmployeeContractSchema>;

const EmployeeUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
});

export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  user_id: z.string().uuid(),
  employee_number: z.string(),
  fullname: z.string(),
  gender: z.string().optional(),
  birth_place: z.string(),
  birth_date: z.number().int(),
  identity_number: z.string().optional(),
  blood_type: z.string(),
  marital_status: z.string(),
  religion: z.string(),
  phone: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string(),
  is_active: z.boolean().optional(),
  contracts: z.array(EmployeeContractSchema).optional(),
  user: EmployeeUserSchema.optional(),
});

export type Employee = z.infer<typeof EmployeeSchema>;
