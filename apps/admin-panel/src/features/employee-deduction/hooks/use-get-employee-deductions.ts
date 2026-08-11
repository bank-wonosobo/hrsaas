import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  EmployeeDeduction,
  SearchEmployeeDeductionRequest,
} from "../schemas/employee-deduction-schema";
import { getEmployeeDeductions } from "../services/employee-deduction-service";

export function useGetEmployeeDeductions(search: SearchEmployeeDeductionRequest) {
  return useQuery<PaginatedData<EmployeeDeduction>>({
    queryKey: [
      "employee-deductions",
      search.employee_id,
      search.active_only,
      search.page,
      search.size,
    ],
    queryFn: () => getEmployeeDeductions(search),
    enabled: !!search.employee_id,
    placeholderData: (prev) => prev,
  });
}
