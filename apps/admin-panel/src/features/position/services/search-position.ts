import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { Position, SearchPositionRequest } from "../schemas/position-schema";

export const searchPosition = async (
  search: SearchPositionRequest,
): Promise<PaginatedData<Position>> => {
  const response = await api.get("/positions", {
    params: {
      key: search.key,
      page: search.page,
      size: search.size,
    },
  });

  const positions = response.data.data; // Validate the response data against the schema

  return { ...response.data, data: positions }; // Return the validated data
};
