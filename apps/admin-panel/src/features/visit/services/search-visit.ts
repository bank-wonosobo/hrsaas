import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { SearchVisitRequest, Visit } from "../schemas/visit-schema";

export const searchVisit = async (
  search: SearchVisitRequest,
): Promise<PaginatedData<Visit>> => {
  const response = await api.get("/visits", {
    params: {
      employee_id: search.employee_id,
      start_date: search.start_date,
      end_date: search.end_date,
      sort_by: search.sort_by,
      page: search.page,
      size: search.size,
    },
  });

  return { ...response.data, data: response.data.data };
};
