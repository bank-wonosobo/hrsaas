import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdateUserRequest } from "../schemas/auth-schema";
import { updateUser } from "../services/user-service";

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateUserRequest) => updateUser(id, request),
    onSuccess: () => {
      toast.success("Data pengguna berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
