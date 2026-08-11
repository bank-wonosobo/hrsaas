import { api } from "@/lib/axios";

export const deleteEmployeeEducation = async (id: string): Promise<void> => {
  await api.delete(`/employee-educations/${id}`);
};
