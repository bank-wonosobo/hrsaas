import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { SignInRequest } from "@/schema/auth-schema";
import { signInUser } from "@/services/user/login";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export const useSignIn = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (credentials: SignInRequest) =>
      signInUser(credentials.email, credentials.password),
    onSuccess: async (data) => {
      await signIn(data.data.token, data.data.user);
      showToast("Login berhasil", "success");
      setTimeout(() => router.replace("/(tabs)/home"), 100);
    },
    onError: (error) => {
      showToast("Email atau password salah", "error");
    },
  });
};
