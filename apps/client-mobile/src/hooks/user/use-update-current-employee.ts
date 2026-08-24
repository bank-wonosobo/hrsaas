import { useToast } from "@/context/toast-context";
import {
  updateCurrentEmployee,
  UpdateCurrentEmployeeDto,
} from "@/services/user/update-current";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateCurrentEmployee = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCurrentEmployeeDto) =>
      updateCurrentEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "current"] });
      showToast("Data berhasil diperbarui", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Gagal memperbarui data", "error");
    },
  });
};
