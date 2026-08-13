import { Employee } from "@/features/employee/employee-schema";
import { api } from "@/lib/axios";

export const getCurrentEmployee = async (): Promise<Employee> => {
  const response = await api.get("/employees/_current");

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memuat data karyawan");
  }

  return response.data.data;
};
