import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import {
  ActionTimeOffApproval,
  TimeOffApproval,
} from "../schemas/time-off-approval-schema";

export const actionTimeOffApproval = async (
  id: string,
  request: ActionTimeOffApproval,
): Promise<ResponseData<TimeOffApproval>> => {
  const response = await api.patch(`/time-off-approvals/${id}`, request);

  if (response.status !== 200) {
    throw new Error(response.data.error || "failed to create employee");
  }

  const employee = response.data.data; // Validate the response data against the schema

  return { ...response.data, data: employee }; // Return the validated data
};
