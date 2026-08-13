import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { Attendance, SearchAttendanceRequest } from "../schemas/attendance-schema";

export const searchAttendance = async (
  search: SearchAttendanceRequest,
): Promise<PaginatedData<Attendance>> => {
  const response = await api.get("/attendances", {
    params: {
      employee_id: search.employee_id,
      start_date: search.start_date,
      end_date: search.end_date,
      status: search.status,
      page: search.page,
      size: search.size,
    },
  });

  return { ...response.data, data: response.data.data };
};
