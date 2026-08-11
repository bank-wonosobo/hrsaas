import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdateEmployeeTraining } from "../schemas/employee-training-schema";
import { updateEmployeeTraining } from "../services/update-employee-training";

export function useUpdateEmployeeTraining(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeTraining }) =>
      updateEmployeeTraining(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employee-trainings"],
        exact: false,
      });
      toast.success("Riwayat pelatihan berhasil diperbarui.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
