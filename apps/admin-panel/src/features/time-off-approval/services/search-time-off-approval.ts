import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import {
  SearchTimeOffApproval,
  TimeOffApproval,
} from "../schemas/time-off-approval-schema";

export const searchTimeOffApproval = async (
  search: SearchTimeOffApproval,
): Promise<PaginatedData<TimeOffApproval>> => {
  const response = await api.get("/time-off-approvals/_current", {
    params: {
      employee_id: search.employee_id,
      status: search.status,
      time_off_type_id: search.time_off_type_id,
      request_status: search.request_status,
      page: search.page,
      size: search.size,
    },
  });

  const timeOffApprovals = response.data.data; // Validate the response data against the schema

  return { ...response.data, data: timeOffApprovals }; // Return the validated data
};
