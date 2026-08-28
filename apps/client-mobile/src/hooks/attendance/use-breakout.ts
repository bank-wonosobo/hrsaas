import { useToast } from "@/context/toast-context";
import { ClockInReq } from "@/schema/attendance-schema";
import { PhotoResult } from "@/schema/photo-schema";
import { breakOutService } from "@/services/attendance/break-out";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

type BreakOutRequest = { data: ClockInReq; photo: PhotoResult };

export const useBreakOut = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ data, photo }: BreakOutRequest) => breakOutService(data, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      showToast("Break out berhasil", "success");
      router.replace("/(tabs)/home");
    },
    onError: (err) => showToast(err.message, "error"),
  });
};
