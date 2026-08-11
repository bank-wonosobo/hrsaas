import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateEmployeeEducation } from "../schemas/employee-education-schema";
import { createEmployeeEducation } from "../services/create-employee-education";

export function useCreateEmployeeEducation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateEmployeeEducation) =>
      createEmployeeEducation(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employee-educations"],
        exact: false,
      });
      toast.success("Riwayat pendidikan berhasil ditambahkan.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
