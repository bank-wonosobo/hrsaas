import { api } from "@/lib/axios";
import { AttendanceLog, ReviewAttendanceLog } from "../schemas/attendance-schema";

export async function reviewAttendanceLog(
  logID: string,
  request: ReviewAttendanceLog,
): Promise<AttendanceLog> {
  const response = await api.patch<{
    data: AttendanceLog;
    error?: string;
    message?: string;
  }>(
    `/attendances/logs/${logID}/review`,
    request,
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      response.data.error ??
        response.data.message ??
        "Gagal memproses persetujuan kehadiran.",
    );
  }

  return response.data.data;
}
