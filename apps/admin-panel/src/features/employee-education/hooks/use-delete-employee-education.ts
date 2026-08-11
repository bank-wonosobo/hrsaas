import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteEmployeeEducation } from "../services/delete-employee-education";

export function useDeleteEmployeeEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEmployeeEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employee-educations"],
        exact: false,
      });
      toast.success("Riwayat pendidikan berhasil dihapus.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
