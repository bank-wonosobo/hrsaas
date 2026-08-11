import { PhotoResult } from "@/schema/photo-schema";
import { uploadSignUrl } from "@/services/upload/upload-sign-url";
import { useMutation } from "@tanstack/react-query";

type UploadSignUrlRequest = {
  uploadUrl: string;
  photo: PhotoResult;
};

export const useUploadSignUrl = () => {
  return useMutation({
    mutationFn: async ({ uploadUrl, photo }: UploadSignUrlRequest) => {
      await uploadSignUrl(uploadUrl, {
        uri: photo.uri,
        mimeType: photo.mimeType,
      });
    },
    onError(err) {
      console.log(err.message, "error");
    },
  });
};
