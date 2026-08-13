import { api } from "@/lib/axios";
import { UpdateEmployeeTraining } from "../schemas/employee-training-schema";

export const updateEmployeeTraining = async (
  id: string,
  data: UpdateEmployeeTraining,
): Promise<void> => {
  await api.put(`/employee-trainings/${id}`, {
    ...data,
    end_date: data.end_date || undefined,
    certificate_url: data.certificate_url || undefined,
  });
};
