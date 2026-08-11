import { useToast } from "@/context/toast-context";
import { PhotoResult } from "@/schema/photo-schema";
import { SignUrl } from "@/schema/upload-schema";
import { VisitForm } from "@/schema/visit-schema";
import { createVisitService } from "@/services/visit/create";
import { uploadSignUrl } from "@/services/upload/upload-sign-url";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

type CreateVisitInput = {
  visit: VisitForm & {
    latitude: string;
    longitude: string;
    address: string;
  };
  photo: PhotoResult;
  signUrl: SignUrl;
};

export const useCreateVisit = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visit, photo, signUrl }: CreateVisitInput) => {
      await uploadSignUrl(signUrl.upload_url, photo);
      await createVisitService({ ...visit, file_url: signUrl.object_key });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      showToast("Kunjungan berhasil disimpan", "success");
      router.back();
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });
};
