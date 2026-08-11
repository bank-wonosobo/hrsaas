import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteEmployeeAllowance } from "../services/employee-allowance-service";

export function useDeleteEmployeeAllowance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployeeAllowance(id),
    onSuccess: () => {
      toast.success("Tunjangan berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["employee-allowances"], exact: false });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
