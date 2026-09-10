import { api } from "@/lib/axios";
import { Salary } from "@/schema/salary-schema";

export const getCurrentSalaries = async (): Promise<Salary[]> => {
  const response = await api.get("/salary/_current");

  if (response.status !== 200) {
    throw new Error(response.data?.error || "Gagal memuat slip gaji");
  }

  return response.data.data;
};
