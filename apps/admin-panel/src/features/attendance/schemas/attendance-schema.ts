import z from "zod/v3";

export const AttendanceLogSchema = z.object({
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
  face_image_url: z.string(),
  device_info: z.string(),
});

export const AttendanceSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  employee_id: z.string(),
  employee_name: z.string().optional(),
  date: z.number(),
  check_in_time: z.number(),
  check_out_time: z.number(),
  status: z.string(),
  logs: z.array(AttendanceLogSchema).optional(),
});

export const SearchAttendanceSchema = z.object({
  employee_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
});

export type AttendanceLog = z.infer<typeof AttendanceLogSchema>;
export type Attendance = z.infer<typeof AttendanceSchema>;
export type SearchAttendanceRequest = z.infer<typeof SearchAttendanceSchema>;
