import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdateEmployeeSalary } from "../schemas/employee-salary-schema";
import { updateEmployeeSalary } from "../services/employee-salary-service";

export function useUpdateEmployeeSalary(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeSalary }) =>
      updateEmployeeSalary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-salaries"], exact: false });
      toast.success("Gaji pokok berhasil diperbarui.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
