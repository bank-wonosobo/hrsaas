import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteEmployeeTraining } from "../services/delete-employee-training";

export function useDeleteEmployeeTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEmployeeTraining(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employee-trainings"],
        exact: false,
      });
      toast.success("Riwayat pelatihan berhasil dihapus.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
