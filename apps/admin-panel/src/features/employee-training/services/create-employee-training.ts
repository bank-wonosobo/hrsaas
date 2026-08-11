import { api } from "@/lib/axios";
import { CreateEmployeeTraining } from "../schemas/employee-training-schema";

export const createEmployeeTraining = async (
  data: CreateEmployeeTraining,
): Promise<void> => {
  await api.post("/employee-trainings", {
    ...data,
    end_date: data.end_date || undefined,
    certificate_url: data.certificate_url || undefined,
  });
};
