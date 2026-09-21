import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { SignInRequest } from "@/schema/auth-schema";
import { signInUser } from "@/services/user/login";
import { useMutation } from "@tanstack/react-query";

export const useSignIn = () => {
  const { signIn } = useAuth();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (credentials: SignInRequest) =>
      signInUser(credentials.email, credentials.password),
    onSuccess: async (data) => {
      await signIn(data.data.token, data.data.user);
      showToast("Login berhasil", "success");
    },
    onError: (error) => {
      showToast("Email atau password salah", "error");
    },
  });
};
