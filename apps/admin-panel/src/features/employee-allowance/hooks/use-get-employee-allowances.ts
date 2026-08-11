import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  EmployeeAllowance,
  SearchEmployeeAllowanceRequest,
} from "../schemas/employee-allowance-schema";
import { getEmployeeAllowances } from "../services/employee-allowance-service";

export function useGetEmployeeAllowances(search: SearchEmployeeAllowanceRequest) {
  return useQuery<PaginatedData<EmployeeAllowance>>({
    queryKey: [
      "employee-allowances",
      search.employee_id,
      search.active_only,
      search.page,
      search.size,
    ],
    queryFn: () => getEmployeeAllowances(search),
    enabled: !!search.employee_id,
    placeholderData: (prev) => prev,
  });
}
