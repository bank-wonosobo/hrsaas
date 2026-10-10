import { api } from "@/lib/axios";
import { Attendance, UpdateAttendance } from "../schemas/attendance-schema";

export async function updateAttendance(
  id: string,
  request: UpdateAttendance,
): Promise<Attendance> {
  const response = await api.put<{
    data: Attendance;
    error?: string;
    message?: string;
  }>(`/attendances/${id}`, request);

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      response.data.error ??
        response.data.message ??
        "Gagal memperbarui data kehadiran.",
    );
  }

  return response.data.data;
}
