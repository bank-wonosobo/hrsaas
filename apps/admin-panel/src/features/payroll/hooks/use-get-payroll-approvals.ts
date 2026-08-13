import { ResponseData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { PayrollApproval } from "../schemas/payroll-schema";
import { getPayrollApprovals } from "../services/payroll-service";

export function useGetPayrollApprovals(id: string) {
  return useQuery<ResponseData<PayrollApproval[]>>({
    queryKey: ["payrolls", id, "approvals"],
    queryFn: () => getPayrollApprovals(id),
    enabled: !!id,
  });
}
