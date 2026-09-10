import { api } from "@/lib/axios";
import { ResponseDataArr } from "@/lib/response";
import { TimeOffType } from "@/schema/time-off-schema";

export const getTimeOffTypes = async (): Promise<
  ResponseDataArr<TimeOffType>
> => {
  const response = await api.get("/time-off-types?size=100");

  if (response.status !== 200) {
    throw new Error(response.data?.error || "Gagal memuat jenis cuti");
  }

  return response.data;
};
