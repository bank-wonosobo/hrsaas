import { useToast } from "@/context/toast-context";
import { createEmployeeEducation } from "@/services/employee-education/create";
import { EmployeeEducationPayload } from "@/services/employee-education/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateEmployeeEducation() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmployeeEducationPayload) =>
      createEmployeeEducation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-educations"] });
      showToast("Riwayat pendidikan berhasil ditambahkan", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Gagal menambahkan riwayat pendidikan", "error");
    },
  });
}
