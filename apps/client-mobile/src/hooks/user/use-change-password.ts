import { useToast } from "@/context/toast-context";
import { ChangePasswordRequest } from "@/schema/user-schema";
import { changePassword } from "@/services/user/change-password";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export const useChangePassword = () => {
  const { showToast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changePassword(payload),
    onSuccess: () => {
      showToast("Password berhasil diubah", "success");
      router.back();
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });
};
