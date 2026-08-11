import { api } from "@/lib/axios";

export const deleteEmployeeTraining = async (id: string): Promise<void> => {
  await api.delete(`/employee-trainings/${id}`);
};
