import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateRole } from "../schemas/role-schema";
import { createRole } from "../services/create-role";

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateRole) => await createRole(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"], exact: false });
      toast.success("Berhasil membuat role.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
