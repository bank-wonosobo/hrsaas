import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { Role, SearchRoleRequest } from "../schemas/role-schema";

export const searchRole = async (
  search: SearchRoleRequest,
): Promise<PaginatedData<Role>> => {
  const response = await api.get("/roles", {
    params: {
      name: search.key,
      page: search.page,
      size: search.size,
    },
  });

  return { ...response.data, data: response.data.data };
};
