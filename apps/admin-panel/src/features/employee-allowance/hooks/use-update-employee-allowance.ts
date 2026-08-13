import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdateEmployeeAllowance } from "../schemas/employee-allowance-schema";
import { updateEmployeeAllowance } from "../services/employee-allowance-service";

export function useUpdateEmployeeAllowance(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeAllowance }) =>
      updateEmployeeAllowance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-allowances"], exact: false });
      toast.success("Tunjangan berhasil diperbarui.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
