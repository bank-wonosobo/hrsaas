import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { Division, SearchDivisionRequest } from "../schemas/division-schema";

export const searchDivision = async (
  search: SearchDivisionRequest,
): Promise<PaginatedData<Division>> => {
  const response = await api.get("/divisions", {
    params: {
      key: search.key,
      page: search.page,
      size: search.size,
    },
  });

  const divisions = response.data.data; // Validate the response data against the schema

  return { ...response.data, data: divisions }; // Return the validated data
};
