import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { calculatePayroll } from "../services/payroll-service";

export function useCalculatePayroll(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => calculatePayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"], exact: false });
      toast.success("Payroll berhasil dihitung.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
