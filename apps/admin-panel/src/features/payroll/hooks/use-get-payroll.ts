import { ResponseData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { Payroll } from "../schemas/payroll-schema";
import { getPayrollById } from "../services/payroll-service";

export function useGetPayroll(id: string) {
  return useQuery<ResponseData<Payroll>>({
    queryKey: ["payrolls", id],
    queryFn: () => getPayrollById(id),
    enabled: !!id,
  });
}
