import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateEmployeeSalary } from "../schemas/employee-salary-schema";
import { createEmployeeSalary } from "../services/employee-salary-service";

export function useCreateEmployeeSalary(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateEmployeeSalary) => createEmployeeSalary(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-salaries"], exact: false });
      toast.success("Gaji pokok berhasil dibuat.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
