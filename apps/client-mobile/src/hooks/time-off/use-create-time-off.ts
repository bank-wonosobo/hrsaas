import { useToast } from "@/context/toast-context";
import { CreateTimeOffRequest } from "@/schema/time-off-schema";
import { createTimeOffService } from "@/services/time-off/create";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export const useCreateTimeOff = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateTimeOffRequest) => createTimeOffService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      queryClient.invalidateQueries({ queryKey: ["time-off-balances"] });
      showToast("Pengajuan cuti berhasil dikirim", "success");
      router.replace("/time-offs");
    },
    onError: (err) => {
      showToast(err.message, "error");
    },
  });
};
