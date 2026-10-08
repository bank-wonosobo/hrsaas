import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteEmployeeSanction } from "../services/create-employee-sanction";

export function useDeleteEmployeeSanction(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployeeSanction(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["employee-sanctions"],
        exact: false,
      });
      toast.success("Sanksi karyawan berhasil dihapus.");
      onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
