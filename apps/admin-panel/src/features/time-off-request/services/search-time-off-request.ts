import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import {
  SearchTimeOffRequest,
  TimeOffRequest,
} from "../schemas/time-off-schema";

export const searchTimeOffRequest = async (
  search: SearchTimeOffRequest,
): Promise<PaginatedData<TimeOffRequest>> => {
  const response = await api.get("/time-off-requests", {
    params: {
      employee_id: search.employee_id,
      time_off_type_id: search.time_off_type_id,
      request_status: search.request_status,
      start_date: search.start_date,
      end_date: search.end_date,
      page: search.page,
      size: search.size,
    },
  });

  const timeOffRequests = response.data.data; // Validate the response data against the schema

  return { ...response.data, data: timeOffRequests }; // Return the validated data
};
