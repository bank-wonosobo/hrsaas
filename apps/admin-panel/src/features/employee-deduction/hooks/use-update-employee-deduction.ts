import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdateEmployeeDeduction } from "../schemas/employee-deduction-schema";
import { updateEmployeeDeduction } from "../services/employee-deduction-service";

export function useUpdateEmployeeDeduction(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeDeduction }) =>
      updateEmployeeDeduction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-deductions"], exact: false });
      toast.success("Potongan berhasil diperbarui.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
