import { Employee } from "@/features/employee/employee-schema";
import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";

export type ListEmployeeParams = {
  key?: string;
  page?: number;
  size?: number;
};

export const listEmployees = async (
  params: ListEmployeeParams,
): Promise<PaginatedData<Employee>> => {
  const response = await api.get("/employees", { params });

  if (response.status !== 200) {
    throw new Error(response.data?.error || "Gagal memuat data karyawan");
  }

  return {
    data: response.data.data,
    paging: response.data.paging,
  };
};
