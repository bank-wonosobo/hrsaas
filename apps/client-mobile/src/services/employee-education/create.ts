import { api } from "@/lib/axios";
import { EmployeeEducationPayload } from "./types";

export const createEmployeeEducation = async (
  payload: EmployeeEducationPayload,
): Promise<void> => {
  const response = await api.post("/employee-educations/", payload);

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Gagal menambahkan riwayat pendidikan",
    );
  }
};
