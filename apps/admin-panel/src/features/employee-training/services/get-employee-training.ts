import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { EmployeeTraining, SearchEmployeeTraining } from "../schemas/employee-training-schema";

export const getEmployeeTrainings = async (
  search: SearchEmployeeTraining,
): Promise<PaginatedData<EmployeeTraining>> => {
  const response = await api.get("/employee-trainings", {
    params: {
      employee_id: search.employee_id,
      page: search.page ?? 1,
      size: search.size ?? 10,
    },
  });

  return { ...response.data, data: response.data.data };
};
