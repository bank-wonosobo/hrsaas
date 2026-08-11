import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { Payroll, SearchPayrollRequest } from "../schemas/payroll-schema";
import { getPayrolls } from "../services/payroll-service";

export function useSearchPayroll(search: SearchPayrollRequest) {
  return useQuery<PaginatedData<Payroll>>({
    queryKey: [
      "payrolls",
      "list",
      search.status ?? "",
      search.period_year ?? 0,
      search.page,
      search.size,
    ],
    queryFn: () => getPayrolls(search),
    placeholderData: (prev) => prev,
  });
}
