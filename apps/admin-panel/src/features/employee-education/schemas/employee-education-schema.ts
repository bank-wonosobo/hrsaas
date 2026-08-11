import z from "zod/v3";

const optionalNumber = (opts?: { min?: number; max?: number }) =>
  z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      if (typeof v === "number" && isNaN(v)) return undefined;
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    },
    z
      .number()
      .min(opts?.min ?? -Infinity)
      .max(opts?.max ?? Infinity)
      .optional(),
  );

export const EmployeeEducationSchema = z.object({
  id: z.string(),
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

export const CreateEmployeeEducationSchema = z.object({
  employee_id: z.string().min(1),
  education_level: z.string().min(1, "Jenjang pendidikan wajib diisi"),
  institution_name: z.string().min(1, "Nama institusi wajib diisi"),
  major: z.string().min(1, "Jurusan wajib diisi"),
  graduation_year: z.string().min(1, "Tanggal kelulusan wajib diisi"),
  gpa: optionalNumber({ min: 0, max: 4 }),
  start_year: optionalNumber(),
  end_year: optionalNumber(),
});

export const UpdateEmployeeEducationSchema = z.object({
  education_level: z.string().min(1, "Jenjang pendidikan wajib diisi"),
  institution_name: z.string().min(1, "Nama institusi wajib diisi"),
  major: z.string().min(1, "Jurusan wajib diisi"),
  graduation_year: z.string().min(1, "Tanggal kelulusan wajib diisi"),
  gpa: optionalNumber({ min: 0, max: 4 }),
  start_year: optionalNumber(),
  end_year: optionalNumber(),
});

export const SearchEmployeeEducationSchema = z.object({
  employee_id: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type EmployeeEducation = z.infer<typeof EmployeeEducationSchema>;
export type CreateEmployeeEducation = z.infer<typeof CreateEmployeeEducationSchema>;
export type UpdateEmployeeEducation = z.infer<typeof UpdateEmployeeEducationSchema>;
export type SearchEmployeeEducation = z.infer<typeof SearchEmployeeEducationSchema>;
