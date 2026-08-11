import { useToast } from "@/context/toast-context";
import { ClockInReq } from "@/schema/attendance-schema";

import { PhotoResult } from "@/schema/photo-schema";
import { clockOutService } from "@/services/attendance/clock-out";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "expo-router";

type ClockInRequest = {
  data: ClockInReq;
  photo: PhotoResult;
};

export const useClockOut = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ data, photo }: ClockInRequest) => {
      await clockOutService(data, photo);
      queryClient.invalidateQueries({
        queryKey: ["attendances"],
      });

      showToast("Clock in berhasil", "success");
      router.replace("/(tabs)/home");
    },
    onError(err) {
      showToast(err.message, "error");
    },
  });
};
