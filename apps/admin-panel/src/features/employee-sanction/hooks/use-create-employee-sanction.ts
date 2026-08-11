import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateEmployeeSanction } from "../schemas/employee-sanction-schema";
import { createEmployeeSanction } from "../services/create-employee-sanction";

export const useCreateEmployeeSanction = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateEmployeeSanction) =>
      await createEmployeeSanction(request),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["employee-sanctions"],
        exact: false,
      });
      toast.success("Berhasil menambahkan sanksi karyawan.");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
