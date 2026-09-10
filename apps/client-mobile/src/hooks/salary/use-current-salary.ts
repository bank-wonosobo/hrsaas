import { getCurrentSalaries } from "@/services/salary/current";
import { useQuery } from "@tanstack/react-query";

export function useCurrentSalary() {
  return useQuery({
    queryKey: ["salary", "current"],
    queryFn: getCurrentSalaries,
  });
}
