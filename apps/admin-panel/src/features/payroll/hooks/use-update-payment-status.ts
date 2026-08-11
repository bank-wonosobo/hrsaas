import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdatePayrollPaymentStatus } from "../schemas/payroll-schema";
import { updatePayrollPaymentStatus } from "../services/payroll-service";

export function useUpdatePaymentStatus(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePayrollPaymentStatus }) =>
      updatePayrollPaymentStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-payments"], exact: false });
      toast.success("Status pembayaran berhasil diperbarui.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
