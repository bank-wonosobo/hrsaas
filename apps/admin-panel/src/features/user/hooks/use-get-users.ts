import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { SearchUserRequest, User } from "../schemas/auth-schema";
import { getUsers } from "../services/user-service";

export function useGetUsers(search: SearchUserRequest) {
  const normalized = {
    key: search.key ?? "",
    page: Number(search.page),
    size: Number(search.size),
  };
  return useQuery<PaginatedData<User>>({
    queryKey: ["users", normalized.key, normalized.page, normalized.size],
    queryFn: async () => getUsers(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
