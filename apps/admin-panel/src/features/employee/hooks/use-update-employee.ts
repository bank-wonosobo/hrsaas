import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdateEmployee } from "../schemas/employee-schema";
import { updateEmployee } from "../services/employee-service";

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateEmployee) => updateEmployee(id, request),
    onSuccess: () => {
      toast.success("Data karyawan berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["employees", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
