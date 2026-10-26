import { useToast } from "@/context/toast-context";
import { updateEmployeeEducation } from "@/services/employee-education/update";
import { EmployeeEducationPayload } from "@/services/employee-education/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateEmployeeEducation() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeEducationPayload }) =>
      updateEmployeeEducation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-educations"] });
      showToast("Riwayat pendidikan berhasil diperbarui", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Gagal memperbarui riwayat pendidikan", "error");
    },
  });
}
