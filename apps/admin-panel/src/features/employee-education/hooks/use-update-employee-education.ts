import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdateEmployeeEducation } from "../schemas/employee-education-schema";
import { updateEmployeeEducation } from "../services/update-employee-education";

export function useUpdateEmployeeEducation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeEducation }) =>
      updateEmployeeEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employee-educations"],
        exact: false,
      });
      toast.success("Riwayat pendidikan berhasil diperbarui.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
