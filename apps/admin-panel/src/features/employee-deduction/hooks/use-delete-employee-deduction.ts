import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteEmployeeDeduction } from "../services/employee-deduction-service";

export function useDeleteEmployeeDeduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployeeDeduction(id),
    onSuccess: () => {
      toast.success("Potongan berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["employee-deductions"], exact: false });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
