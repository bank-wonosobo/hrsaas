import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdateEmployeeSanction } from "../schemas/employee-sanction-schema";
import { updateEmployeeSanction } from "../services/create-employee-sanction";

export function useUpdateEmployeeSanction(
  id: string,
  onSuccess?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateEmployeeSanction) =>
      updateEmployeeSanction(id, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["employee-sanctions"],
        exact: false,
      });
      await queryClient.invalidateQueries({
        queryKey: ["employee-sanction", id],
      });
      toast.success("Sanksi karyawan berhasil diperbarui.");
      onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
