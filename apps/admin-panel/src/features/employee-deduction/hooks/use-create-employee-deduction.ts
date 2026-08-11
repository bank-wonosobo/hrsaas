import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateEmployeeDeduction } from "../schemas/employee-deduction-schema";
import { createEmployeeDeduction } from "../services/employee-deduction-service";

export function useCreateEmployeeDeduction(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateEmployeeDeduction) => createEmployeeDeduction(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-deductions"], exact: false });
      toast.success("Potongan berhasil dibuat.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
