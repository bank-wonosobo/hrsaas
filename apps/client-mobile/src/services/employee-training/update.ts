import { api } from "@/lib/axios";
import { EmployeeTrainingPayload } from "./types";

export const updateEmployeeTraining = async (
  id: string,
  payload: EmployeeTrainingPayload,
): Promise<void> => {
  const response = await api.put(`/employee-trainings/${id}`, {
    ...payload,
    end_date: payload.end_date || undefined,
    certificate_url: payload.certificate_url || undefined,
  });

  if (response.status !== 200 && response.status !== 204) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Gagal memperbarui riwayat pelatihan",
    );
  }
};
