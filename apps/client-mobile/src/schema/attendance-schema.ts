import z from "zod/v3";

export const AttendanceSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  employee_position: z.string(),
  date: z.number(),
  check_in_time: z.number(),
  check_out_time: z.number().optional(),
  total_work_minutes: z.number(),
  total_break_minutes: z.number(),
  status: z.string(),
});

export const ClokInReqSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  device_info: z.string(),
  is_allowed: z.boolean(),
});

export const CheckFaceResSchema = z.object({
  employee_id: z.string(),
  registered: z.boolean(),
});

export const RegisterFaceResSchema = z.object({
  employee_id: z.string(),
  face_image_url: z.string(),
});

export type Attendance = z.infer<typeof AttendanceSchema>;

export type ClockInReq = z.infer<typeof ClokInReqSchema>;

export type CheckFaceRes = z.infer<typeof CheckFaceResSchema>;

export type RegisterFaceRes = z.infer<typeof RegisterFaceResSchema>;
