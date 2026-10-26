import { api } from "@/lib/axios";
import { EmployeeEducationPayload } from "./types";

export const updateEmployeeEducation = async (
  id: string,
  payload: EmployeeEducationPayload,
): Promise<void> => {
  const response = await api.put(
    `/employee-educations/_current/${id}`,
    payload,
  );

  if (response.status !== 200 && response.status !== 204) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Gagal memperbarui riwayat pendidikan",
    );
  }
};
