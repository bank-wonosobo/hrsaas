import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ResetPasswordRequest } from "../schemas/auth-schema";
import { resetUserPassword } from "../services/user-service";

export function useResetPassword(id: string) {
  return useMutation({
    mutationFn: (request: ResetPasswordRequest) =>
      resetUserPassword(id, request),
    onSuccess: () => {
      toast.success("Password berhasil direset");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
