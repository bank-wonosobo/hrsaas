import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreatePayrollAdjustment } from "../schemas/payroll-schema";
import { createPayrollAdjustment } from "../services/payroll-service";

export function useCreatePayrollAdjustment(payrollId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payrollDetailId,
      data,
    }: {
      payrollDetailId: string;
      data: CreatePayrollAdjustment;
    }) => createPayrollAdjustment(payrollDetailId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls", payrollId], exact: false });
      queryClient.invalidateQueries({ queryKey: ["payrolls", "list"], exact: false });
      toast.success("Penyesuaian berhasil ditambahkan.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
