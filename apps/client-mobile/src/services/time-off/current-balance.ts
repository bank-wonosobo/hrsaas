import { api } from "@/lib/axios";
import { TimeOffBalance } from "@/schema/time-off-schema";

export const getCurrentTimeOffBalance = async (): Promise<TimeOffBalance[]> => {
  const currentYear = new Date().getFullYear();
  const response = await api.get(
    `/time-off-balances?period_year=${currentYear}`,
  );

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memuat data karyawan");
  }

  return response.data.data;
};
