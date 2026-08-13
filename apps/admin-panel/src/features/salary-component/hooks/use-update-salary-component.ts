import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdateSalaryComponent } from "../schemas/salary-component-schema";
import { updateSalaryComponent } from "../services/salary-component-service";

export function useUpdateSalaryComponent(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalaryComponent }) =>
      updateSalaryComponent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-components"], exact: false });
      toast.success("Komponen gaji berhasil diperbarui.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
