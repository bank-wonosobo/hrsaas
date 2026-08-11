import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { submitPayroll } from "../services/payroll-service";

export function useSubmitPayroll(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitPayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"], exact: false });
      toast.success("Payroll berhasil diajukan untuk persetujuan.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
