import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { EmployeeTraining } from "@/schema/employee-training-schema";

export type ListEmployeeTrainingParams = {
  page?: number;
  size?: number;
};

export const listEmployeeTrainings = async (
  params: ListEmployeeTrainingParams,
): Promise<PaginatedData<EmployeeTraining>> => {
  const response = await api.get("/employee-trainings/_current", {
    params,
  });

  if (response.status !== 200) {
    throw new Error(response.data?.error || "Gagal memuat riwayat pelatihan");
  }

  return {
    data: response.data.data,
    paging: response.data.paging,
  };
};
