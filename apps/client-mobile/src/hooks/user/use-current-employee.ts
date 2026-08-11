import { getCurrentEmployee } from "@/services/user/current";
import { useQuery } from "@tanstack/react-query";

export function useCurrentEmployee() {
  return useQuery({
    queryKey: ["employees", "current"],
    queryFn: getCurrentEmployee,
  });
}
