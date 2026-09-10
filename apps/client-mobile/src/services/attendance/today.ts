import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import { Attendance } from "@/schema/attendance-schema";

export const getTodayAttendance = async (): Promise<Attendance | null> => {
  const response = await api.get<ResponseData<Attendance | null>>(
    "/attendances/_today",
  );

  // Endpoint returns 404 when the employee has not checked in yet today.
  if (response.status === 404) {
    return null;
  }

  if (response.status !== 200) {
    throw new Error(response.data?.message || "Gagal memuat presensi hari ini");
  }

  return response.data?.data ?? null;
};
