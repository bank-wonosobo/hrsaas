import { api } from "@/lib/axios";
import { CreateEmployeeEducation } from "../schemas/employee-education-schema";

export const createEmployeeEducation = async (
  data: CreateEmployeeEducation,
): Promise<void> => {
  await api.post("/employee-educations", data);
};
