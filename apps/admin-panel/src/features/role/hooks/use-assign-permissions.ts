import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { assignPermissions } from "../services/assign-permissions";

export const useAssignPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roleId,
      permissions,
    }: {
      roleId: string;
      permissions: string[];
    }) => await assignPermissions(roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"], exact: false });
      toast.success("Berhasil mengassign permissions.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
