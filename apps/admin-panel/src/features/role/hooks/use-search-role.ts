import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { Role, SearchRoleRequest } from "../schemas/role-schema";
import { searchRole } from "../services/search-role";

export function useSearchRole(search: SearchRoleRequest) {
  const normalized = {
    key: search.key ?? "",
    page: Number(search.page),
    size: Number(search.size),
  };
  return useQuery<PaginatedData<Role>>({
    queryKey: ["roles", normalized.key, normalized.page, normalized.size],
    queryFn: async () => searchRole(normalized),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
