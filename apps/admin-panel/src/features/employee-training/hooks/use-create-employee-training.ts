import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateEmployeeTraining } from "../schemas/employee-training-schema";
import { createEmployeeTraining } from "../services/create-employee-training";

export function useCreateEmployeeTraining(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateEmployeeTraining) =>
      createEmployeeTraining(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employee-trainings"],
        exact: false,
      });
      toast.success("Riwayat pelatihan berhasil ditambahkan.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
