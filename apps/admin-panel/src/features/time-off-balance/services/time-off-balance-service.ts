import { api } from "@/lib/axios";
import { ResponseData, ResponseDataArr } from "@/lib/response";
import {
  CreateTimeOffBalance,
  SearchTimeOffBalance,
  TimeOffBalance,
} from "../schemas/time-off-balance-schema";

export const getTimeOffBalances = async (
  search: SearchTimeOffBalance,
): Promise<ResponseDataArr<TimeOffBalance>> => {
  const response = await api.get("/time-off-balances", {
    params: {
      employee_id: search.employee_id,
      time_off_type_id: search.time_off_type_id || undefined,
      period_year: search.period_year,
    },
  });

  return { ...response.data, data: response.data.data };
};

export const createTimeOffBalance = async (
  request: CreateTimeOffBalance,
): Promise<ResponseData<TimeOffBalance>> => {
  const response = await api.post("/time-off-balances/_set", request);

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menyimpan saldo cuti");
  }

  return response.data;
};
