import { useToast } from "@/context/toast-context";
import { ClockInReq } from "@/schema/attendance-schema";
import { PhotoResult } from "@/schema/photo-schema";
import { breakInService } from "@/services/attendance/break-in";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

type BreakInRequest = { data: ClockInReq; photo: PhotoResult };

export const useBreakIn = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ data, photo }: BreakInRequest) => breakInService(data, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      showToast("Break in berhasil", "success");
      router.replace("/(tabs)/home");
    },
    onError: (err) => showToast(err.message, "error"),
  });
};
