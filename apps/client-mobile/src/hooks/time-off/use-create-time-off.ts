import { useToast } from "@/context/toast-context";
import { PhotoResult } from "@/schema/photo-schema";
import { CreateTimeOffRequest } from "@/schema/time-off-schema";
import { SignUrl } from "@/schema/upload-schema";
import { createTimeOffService } from "@/services/time-off/create";
import { uploadSignUrl } from "@/services/upload/upload-sign-url";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export const useCreateTimeOff = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (request: {
      data: CreateTimeOffRequest;
      photo?: PhotoResult | null;
      signUrl?: SignUrl;
    }) => {
      let file_url: string | undefined;
      if (request.photo && request.signUrl) {
        await uploadSignUrl(request.signUrl.upload_url, request.photo);
        file_url = request.signUrl.object_key;
      }

      return createTimeOffService({
        ...request.data,
        file_url,
      });
    },
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
