import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateEmployeeContract } from "../schemas/employee-contract-schema";
import { createEmployeeContract } from "../services/employee-contract-service";

export function useCreateEmployeeContract(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateEmployeeContract) => createEmployeeContract(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-contracts"], exact: false });
      toast.success("Kontrak karyawan berhasil dibuat.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
