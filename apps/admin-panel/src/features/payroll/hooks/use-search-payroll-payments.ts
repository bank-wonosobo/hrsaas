import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  PayrollPayment,
  SearchPayrollPaymentRequest,
} from "../schemas/payroll-schema";
import { getPayrollPayments } from "../services/payroll-service";

export function useSearchPayrollPayments(search: SearchPayrollPaymentRequest) {
  return useQuery<PaginatedData<PayrollPayment>>({
    queryKey: [
      "payroll-payments",
      search.payroll_id ?? "",
      search.status ?? "",
      search.page,
      search.size,
    ],
    queryFn: () => getPayrollPayments(search),
    enabled: !!search.payroll_id,
    placeholderData: (prev) => prev,
  });
}
