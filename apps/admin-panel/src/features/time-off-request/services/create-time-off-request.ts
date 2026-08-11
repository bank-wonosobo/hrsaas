import { api } from "@/lib/axios";
import { CreateTimeOffRequest } from "../schemas/time-off-schema";

export const createTimeOffRequest = async (
  employeeId: string,
  data: Omit<CreateTimeOffRequest, "employee_id">,
): Promise<void> => {
  const response = await api.post(`/time-off-requests/${employeeId}`, data);

  if (response.status !== 200) {
    throw new Error(response.data?.error ?? "Gagal membuat pengajuan cuti");
  }
};
