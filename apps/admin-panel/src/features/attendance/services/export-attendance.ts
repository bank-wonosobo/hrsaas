import { api } from "@/lib/axios";
import { SearchAttendanceRequest } from "../schemas/attendance-schema";

export const exportAttendance = async (
  search: SearchAttendanceRequest,
): Promise<Blob> => {
  const response = await api.get("/attendances/_export", {
    params: {
      employee_id: search.employee_id || undefined,
      start_date: search.start_date || undefined,
      end_date: search.end_date || undefined,
      status: search.status || undefined,
    },
    responseType: "blob",
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error("Gagal mengunduh data kehadiran.");
  }

  return response.data;
};
