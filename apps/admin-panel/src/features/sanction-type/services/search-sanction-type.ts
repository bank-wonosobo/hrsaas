import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import {
  SanctionType,
  SearchSanctionTypeRequest,
} from "../schemas/sanction-type-schema";

export const searchSanctionType = async (
  search: SearchSanctionTypeRequest,
): Promise<PaginatedData<SanctionType>> => {
  const response = await api.get("/sanctions", {
    params: {
      key: search.key,
      page: search.page,
      size: search.size,
    },
  });

  return { ...response.data, data: response.data.data };
};
