import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdateEmployeeContract } from "../schemas/employee-contract-schema";
import { updateEmployeeContract } from "../services/employee-contract-service";

export function useUpdateEmployeeContract(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeContract }) =>
      updateEmployeeContract(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-contracts"], exact: false });
      toast.success("Kontrak karyawan berhasil diperbarui.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
