import { useToast } from "@/context/toast-context";
import { CreditCollectionVisit } from "@/schema/credit-collection-schema";
import { PhotoResult } from "@/schema/photo-schema";
import { SignUrl } from "@/schema/upload-schema";
import { visitCreditCollection } from "@/services/credit-collection/visit";
import { uploadSignUrl } from "@/services/upload/upload-sign-url";
import { useMutation } from "@tanstack/react-query";

import { useRouter } from "expo-router";

export const useCreditCollectionVisit = () => {
  const router = useRouter();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (request: {
      visit: CreditCollectionVisit;
      photo: PhotoResult;
      signUrl: SignUrl;
    }) => {
      await uploadSignUrl(request.signUrl.upload_url, request.photo);
      await visitCreditCollection(request.visit);
    },
    onSuccess: async () => {
      showToast("Penagihan berhasil", "success");
      router.replace("/(tabs)/home");
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });
};
