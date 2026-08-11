import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateEmployeeAllowance } from "../schemas/employee-allowance-schema";
import { createEmployeeAllowance } from "../services/employee-allowance-service";

export function useCreateEmployeeAllowance(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateEmployeeAllowance) => createEmployeeAllowance(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-allowances"], exact: false });
      toast.success("Tunjangan berhasil dibuat.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
