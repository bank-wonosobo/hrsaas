import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cancelPayroll } from "../services/payroll-service";

export function useCancelPayroll(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelPayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"], exact: false });
      toast.success("Payroll berhasil dibatalkan.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
