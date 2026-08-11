import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreatePermission } from "../schemas/permission-schema";
import { createPermission } from "../services/create-permission";

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreatePermission) => await createPermission(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"], exact: false });
      toast.success("Berhasil membuat permission.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
