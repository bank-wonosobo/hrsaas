import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { Attendance } from "@/schema/attendance-schema";

export type ListAttendanceParams = {
  page?: number;
  size?: number;
};

export const listAttendance = async (
  params: ListAttendanceParams,
): Promise<PaginatedData<Attendance>> => {
  const response = await api.get("/attendances/_current", { params });

  return {
    data: response.data.data,
    paging: response.data.paging,
  };
};
