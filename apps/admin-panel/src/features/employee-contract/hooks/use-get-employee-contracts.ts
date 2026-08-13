import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  EmployeeContract,
  SearchEmployeeContractRequest,
} from "../schemas/employee-contract-schema";
import { getEmployeeContracts } from "../services/employee-contract-service";

export function useGetEmployeeContracts(search: SearchEmployeeContractRequest) {
  return useQuery<PaginatedData<EmployeeContract>>({
    queryKey: [
      "employee-contracts",
      search.employee_id,
      search.division_id,
      search.position_id,
      search.active_only,
      search.page,
      search.size,
    ],
    queryFn: () => getEmployeeContracts(search),
    enabled: !!search.employee_id,
    placeholderData: (prev) => prev,
  });
}
