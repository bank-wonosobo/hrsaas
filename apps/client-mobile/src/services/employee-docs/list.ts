import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { EmployeeDocument } from "@/schema/employee-docs-schema";

export type ListEmployeeDocumentParams = {
  page?: number;
  size?: number;
};

export const listEmployeeDocuments = async (
  params: ListEmployeeDocumentParams,
): Promise<PaginatedData<EmployeeDocument>> => {
  const response = await api.get("/employee-docs/_current", { params });

  if (response.status !== 200) {
    throw new Error(response.data?.error || "Gagal memuat dokumen karyawan");
  }

  return {
    data: response.data.data,
    paging: response.data.paging,
  };
};
