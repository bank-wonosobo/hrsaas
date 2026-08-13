import { ListEmployeeParams, listEmployees } from "@/services/employee/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useEmployees(params: ListEmployeeParams) {
  return useQuery({
    queryKey: ["employees", "list", params],
    queryFn: () => listEmployees(params),
    placeholderData: keepPreviousData,
  });
}
