import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { Permission, SearchPermissionRequest } from "../schemas/permission-schema";
import { searchPermission } from "../services/search-permission";

export function useSearchPermission(search: SearchPermissionRequest) {
  const normalized = {
    key: search.key ?? "",
    page: Number(search.page),
    size: Number(search.size),
  };
  return useQuery<PaginatedData<Permission>>({
    queryKey: ["permissions", normalized.key, normalized.page, normalized.size],
    queryFn: async () => searchPermission(normalized),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
