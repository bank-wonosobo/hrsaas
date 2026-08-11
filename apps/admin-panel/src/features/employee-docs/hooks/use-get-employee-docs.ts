import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  EmployeeDocument,
  SearchEmployeeDocument,
} from "../schemas/employee-docs-schema";
import { getEmployeeDocs } from "../services/get-employee-docs";

export function useGetEmployeeDocs(search: SearchEmployeeDocument) {
  return useQuery<PaginatedData<EmployeeDocument>>({
    queryKey: ["employee-docs", search],
    queryFn: () => getEmployeeDocs(search),
    enabled: !!search.employee_id,
    placeholderData: (prev) => prev,
  });
}
