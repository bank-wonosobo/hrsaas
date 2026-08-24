import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { TimeOffRequest } from "@/schema/time-off-schema";

export type ListTimeOffParams = {
  request_status?: string;
  page?: number;
  size?: number;
};

export const listTimeOff = async (
  params: ListTimeOffParams,
): Promise<PaginatedData<TimeOffRequest>> => {
  const response = await api.get("/time-off-requests", { params });

  return {
    data: response.data.data,
    paging: response.data.paging,
  };
};
