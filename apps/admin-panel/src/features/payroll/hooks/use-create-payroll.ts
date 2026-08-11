import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CreatePayroll } from "../schemas/payroll-schema";
import { createPayroll } from "../services/payroll-service";

export function useCreatePayroll(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (request: CreatePayroll) => createPayroll(request),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"], exact: false });
      toast.success("Payroll berhasil dibuat.");
      onSuccess?.();
      router.push(`/payrolls/${response.data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
