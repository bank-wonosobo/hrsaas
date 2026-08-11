import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import {
  EmployeeDocument,
  SearchEmployeeDocument,
} from "../schemas/employee-docs-schema";

export const getEmployeeDocs = async (
  search: SearchEmployeeDocument,
): Promise<PaginatedData<EmployeeDocument>> => {
  const response = await api.get("/employee-docs", {
    params: {
      employee_id: search.employee_id,
      page: search.page ?? 1,
      size: search.size ?? 10,
    },
  });

  return { ...response.data, data: response.data.data };
};
