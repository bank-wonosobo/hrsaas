import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import {
  CreateTimeOffRequest,
  TimeOffRequest,
} from "@/schema/time-off-schema";

export const createTimeOffService = async (
  payload: CreateTimeOffRequest,
): Promise<ResponseData<TimeOffRequest>> => {
  const response = await api.post("/time-off-requests/", {
    ...payload,
    request_status: "PENDING",
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Gagal mengajukan cuti",
    );
  }

  return response.data;
};
