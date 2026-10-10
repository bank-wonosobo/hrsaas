import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import {
  AttendanceLog,
  SearchPendingAttendanceLogs,
} from "../schemas/attendance-schema";

export async function searchPendingAttendanceLogs(
  search: SearchPendingAttendanceLogs,
): Promise<PaginatedData<AttendanceLog>> {
  const response = await api.get<
    PaginatedData<AttendanceLog> & { error?: string; message?: string }
  >(
    "/attendances/logs/pending",
    {
      params: {
        page: search.page,
        size: search.size,
      },
    },
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      response.data.error ??
        response.data.message ??
        "Gagal memuat daftar persetujuan kehadiran.",
    );
  }

  return response.data;
}
