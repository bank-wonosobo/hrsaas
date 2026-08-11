import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { payPayroll } from "../services/payroll-service";

export function usePayPayroll(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => payPayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"], exact: false });
      toast.success("Pembayaran payroll berhasil diproses.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
