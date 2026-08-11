import { clearAuthUser } from "@/lib/auth-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logout } from "../services/auth-service";

export const useLogout = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuthUser();
      router.replace("/sign-in");
    },
  });
};
