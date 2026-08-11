import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateEmployeeDocument } from "../schemas/employee-docs-schema";
import { createEmployeeDocument } from "../services/create-employee-docs";

export function useCreateEmployeeDocument(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateEmployeeDocument) =>
      createEmployeeDocument(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employee-docs"],
        exact: false,
      });
      toast.success("Dokumen karyawan berhasil ditambahkan.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
