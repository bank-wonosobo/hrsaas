import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { EmployeeEducation, SearchEmployeeEducation } from "../schemas/employee-education-schema";

export const getEmployeeEducations = async (
  search: SearchEmployeeEducation,
): Promise<PaginatedData<EmployeeEducation>> => {
  const response = await api.get("/employee-educations", {
    params: {
      employee_id: search.employee_id,
      page: search.page ?? 1,
      size: search.size ?? 10,
    },
  });

  return { ...response.data, data: response.data.data };
};
