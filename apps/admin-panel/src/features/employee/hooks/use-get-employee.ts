import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { Employee, SearchEmployeeRequest } from "../schemas/employee-schema";
import { getEmployees } from "../services/employee-service";

export function useGetEmployees(search: SearchEmployeeRequest) {
  const normalized = {
    key: search.key ?? "",
    page: Number(search.page),
    size: Number(search.size),
  };
  return useQuery<PaginatedData<Employee>>({
    queryKey: ["employees", normalized.key, normalized.page, normalized.size],
    queryFn: async () => getEmployees(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
