import { api } from "@/lib/axios";
import { EmployeeTrainingPayload } from "./types";

export const createEmployeeTraining = async (
  payload: EmployeeTrainingPayload,
): Promise<void> => {
  const response = await api.post("/employee-trainings/", {
    ...payload,
    end_date: payload.end_date || undefined,
    certificate_url: payload.certificate_url || undefined,
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Gagal menambahkan riwayat pelatihan",
    );
  }
};
