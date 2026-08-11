import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import {
  CreateTimeOffType,
  TimeOffType,
  TimeOffTypeSchema,
} from "../schemas/time-off-type-schema";

export const createTimeOffType = async (
  request: CreateTimeOffType,
): Promise<ResponseData<TimeOffType>> => {
  const response = await api.post("/time-off-types", request);

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat jenis cuti");
  }

  const data = TimeOffTypeSchema.parse(response.data.data);

  return { ...response.data, data };
};
