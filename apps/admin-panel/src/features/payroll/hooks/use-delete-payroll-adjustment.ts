import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deletePayrollAdjustment } from "../services/payroll-service";

export function useDeletePayrollAdjustment(payrollId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePayrollAdjustment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls", payrollId], exact: false });
      queryClient.invalidateQueries({ queryKey: ["payrolls", "list"], exact: false });
      toast.success("Penyesuaian berhasil dihapus.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
