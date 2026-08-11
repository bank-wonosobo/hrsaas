import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { EmployeeSanction } from "@/schema/sanction-schema";

export type ListSanctionParams = {
  sanction_id?: string;
  reason?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  page?: number;
  size?: number;
};

export const listSanctions = async (
  params: ListSanctionParams,
): Promise<PaginatedData<EmployeeSanction>> => {
  const response = await api.get("/employee-sanctions/_current", { params });

  if (response.status !== 200) {
    throw new Error(response.data?.error || "Gagal memuat data sanksi");
  }

  return {
    data: response.data.data,
    paging: response.data.paging,
  };
};
