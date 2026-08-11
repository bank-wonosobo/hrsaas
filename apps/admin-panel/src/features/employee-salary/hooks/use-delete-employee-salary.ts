import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteEmployeeSalary } from "../services/employee-salary-service";

export function useDeleteEmployeeSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployeeSalary(id),
    onSuccess: () => {
      toast.success("Gaji pokok berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["employee-salaries"], exact: false });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
