import { api } from "@/lib/axios";
import { TimeOffType } from "../schemas/time-off-type-schema";

export const getAllTimeOffType = async (): Promise<TimeOffType[]> => {
  const response = await api.get("/time-off-types");

  return response.data.data;
};
