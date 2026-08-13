import { DivisionSchema } from "@/features/division/schemas/division-schema";
import { PositionSchema } from "@/features/position/schemas/position-schema";
import z from "zod/v3";

const EmployeeRefSchema = z.object({
  id: z.string(),
  employee_number: z.string(),
  fullname: z.string(),
  phone: z.string().optional(),
  gender: z.string().optional(),
});

export const EMPLOYEE_STATUS_OPTIONS = [
  "A1", "A2", "A3", "A4",
  "B1", "B2", "B3", "B4",
  "C1", "C2", "C3", "C4",
  "D1", "D2",
] as const;

export type EmployeeStatus = typeof EMPLOYEE_STATUS_OPTIONS[number];

export const EmployeeContractSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  contract_type: z.string(),
  start_date: z.number(),
  end_date: z.number().nullable().optional(),
  division_id: z.string(),
  position_id: z.string(),
  salary: z.number(),
  employee_status: z.enum(EMPLOYEE_STATUS_OPTIONS).nullable().optional(),
  is_active: z.boolean(),
  division: DivisionSchema,
  position: PositionSchema,
  employee: EmployeeRefSchema.optional(),
});

export const CreateEmployeeContractSchema = z.object({
  employee_id: z.string().min(1),
  contract_type: z.string().min(1, "Jenis kontrak wajib diisi"),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
  end_date: z.string().optional(),
  division_id: z.string().min(1, "Divisi wajib dipilih"),
  position_id: z.string().min(1, "Jabatan wajib dipilih"),
  salary: z.coerce.number().min(0, "Gaji tidak boleh negatif"),
  employee_status: z.enum(EMPLOYEE_STATUS_OPTIONS).optional(),
});

export const SearchEmployeeContractRequestSchema = z.object({
  employee_id: z.string().optional(),
  division_id: z.string().optional(),
  position_id: z.string().optional(),
  active_only: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export const UpdateEmployeeContractSchema = z.object({
  contract_type: z.string().min(1, "Jenis kontrak wajib diisi"),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
  end_date: z.string().optional(),
  division_id: z.string().min(1, "Divisi wajib dipilih"),
  position_id: z.string().min(1, "Jabatan wajib dipilih"),
  salary: z.coerce.number().min(0, "Gaji tidak boleh negatif"),
  employee_status: z.enum(EMPLOYEE_STATUS_OPTIONS).optional(),
});

export type EmployeeContract = z.infer<typeof EmployeeContractSchema>;
export type CreateEmployeeContract = z.infer<typeof CreateEmployeeContractSchema>;
export type UpdateEmployeeContract = z.infer<typeof UpdateEmployeeContractSchema>;
export type SearchEmployeeContractRequest = z.infer<typeof SearchEmployeeContractRequestSchema>;
