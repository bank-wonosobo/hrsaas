import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteSalaryComponent } from "../services/salary-component-service";

export function useDeleteSalaryComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSalaryComponent(id),
    onSuccess: () => {
      toast.success("Komponen gaji berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["salary-components"], exact: false });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
