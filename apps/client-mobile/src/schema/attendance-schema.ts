import z from "zod/v3";

export const AttendanceSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  employee_position: z.string(),
  date: z.number(),
  check_in_time: z.number().nullable().optional(),
  check_out_time: z.number().nullable().optional(),
  total_work_minutes: z.number(),
  total_break_minutes: z.number(),
  status: z.string(),
  logs: z
    .array(
      z.object({
        id: z.string(),
        attendance_id: z.string(),
        type: z.string(),
        time: z.number(),
        lat: z.number(),
        lng: z.number(),
        location_distance: z.number(),
        is_location_verified: z.boolean(),
        is_face_verified: z.boolean(),
        face_confidence: z.number(),
        face_image_url: z.string().nullable().optional(),
        is_approved: z.boolean(),
        device_info: z.string(),
      }),
    )
    .optional(),
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
