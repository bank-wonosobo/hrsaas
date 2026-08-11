import { api } from "@/lib/axios";
import { UpdateEmployeeEducation } from "../schemas/employee-education-schema";

export const updateEmployeeEducation = async (
  id: string,
  data: UpdateEmployeeEducation,
): Promise<void> => {
  await api.put(`/employee-educations/${id}`, data);
};
