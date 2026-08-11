import { saveAuthUser } from "@/lib/auth-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SignInRequest } from "../schemas/auth-schema";
import { login } from "../services/auth-service";

export const useLogin = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (credentials: SignInRequest) =>
      await login(credentials.email, credentials.password),
    onSuccess: async (data) => {
      saveAuthUser(data.data.user);
      toast.success("Login successful!");

      router.refresh(); // 🔥 penting
      setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
