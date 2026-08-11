import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import { Attendance } from "../schemas/attendance-schema";

export const getAttendanceDetail = async (
  id: string,
): Promise<ResponseData<Attendance>> => {
  const response = await api.get(`/attendances/${id}`);

  if (response.status !== 200) {
    throw new Error(response.data?.error || response.data?.message || "Gagal mengambil detail kehadiran");
  }

  return response.data;
};
