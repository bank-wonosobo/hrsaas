import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { Permission, SearchPermissionRequest } from "../schemas/permission-schema";

export const searchPermission = async (
  search: SearchPermissionRequest,
): Promise<PaginatedData<Permission>> => {
  const response = await api.get("/permissions", {
    params: {
      name: search.key,
      page: search.page,
      size: search.size,
    },
  });

  return { ...response.data, data: response.data.data };
};
