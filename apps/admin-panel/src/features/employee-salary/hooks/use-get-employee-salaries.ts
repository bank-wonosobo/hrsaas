import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  EmployeeSalary,
  SearchEmployeeSalaryRequest,
} from "../schemas/employee-salary-schema";
import { getEmployeeSalaries } from "../services/employee-salary-service";

export function useGetEmployeeSalaries(search: SearchEmployeeSalaryRequest) {
  return useQuery<PaginatedData<EmployeeSalary>>({
    queryKey: [
      "employee-salaries",
      search.employee_id,
      search.active_only,
      search.page,
      search.size,
    ],
    queryFn: () => getEmployeeSalaries(search),
    enabled: !!search.employee_id,
    placeholderData: (prev) => prev,
  });
}
