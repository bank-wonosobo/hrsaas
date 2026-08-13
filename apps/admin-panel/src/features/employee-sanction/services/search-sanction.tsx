import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import {
  EmployeeSanction,
  SearchEmployeeSanctionRequest,
} from "../schemas/employee-sanction-schema";

export const searchSanction = async (
  search: SearchEmployeeSanctionRequest,
): Promise<PaginatedData<EmployeeSanction>> => {
  const response = await api.get("/employee-sanctions", {
    params: {
      page: search.page,
      size: search.size,
      employee_id: search.employee_id,
      sanction_id: search.sanction_id,
      reason: search.reason,
      start_date: search.start_date,
      end_date: search.end_date,
      status:
        search.status === true
          ? "active"
          : search.status === false
            ? "inactive"
            : undefined,
    },
  });

  return { ...response.data, data: response.data.data };
};
