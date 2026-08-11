import { ResponseData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { User } from "../schemas/auth-schema";
import { getUserById } from "../services/user-service";

export function useDetailUser(id: string) {
  return useQuery<ResponseData<User>>({
    queryKey: ["users", id],
    queryFn: async () => getUserById(id),
    retry: 2,
  });
}
