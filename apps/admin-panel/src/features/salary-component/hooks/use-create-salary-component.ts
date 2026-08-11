import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateSalaryComponent } from "../schemas/salary-component-schema";
import { createSalaryComponent } from "../services/salary-component-service";

export function useCreateSalaryComponent(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateSalaryComponent) =>
      createSalaryComponent(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-components"], exact: false });
      toast.success("Komponen gaji berhasil dibuat.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
