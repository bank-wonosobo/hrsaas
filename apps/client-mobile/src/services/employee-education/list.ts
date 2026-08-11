import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { EmployeeEducation } from "@/schema/employee-education-schema";

export type ListEmployeeEducationParams = {
  page?: number;
  size?: number;
};

export const listEmployeeEducations = async (
  params: ListEmployeeEducationParams,
): Promise<PaginatedData<EmployeeEducation>> => {
  const response = await api.get("/employee-educations/_current", {
    params,
  });

  if (response.status !== 200) {
    throw new Error(
      response.data?.error || "Gagal memuat riwayat pendidikan",
    );
  }

  return {
    data: response.data.data,
    paging: response.data.paging,
  };
};
