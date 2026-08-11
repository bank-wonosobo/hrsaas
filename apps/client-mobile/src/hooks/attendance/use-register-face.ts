import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { PhotoResult } from "@/schema/photo-schema";
import { SignUrl } from "@/schema/upload-schema";

import { registerFace } from "@/services/attendance/register-face";
import { uploadSignUrl } from "@/services/upload/upload-sign-url";
import { useMutation } from "@tanstack/react-query";

import { useRouter } from "expo-router";

export const useRegisterFace = () => {
  const { showToast } = useToast();
  const { user, setUser } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (request: { photo: PhotoResult; signUrl: SignUrl }) => {
      if (!user) {
        showToast("Pengguna tidak ditemukan", "error");
        return;
      }

      await uploadSignUrl(request.signUrl.upload_url, request.photo);
      await registerFace(request.signUrl.object_key);

      setUser({
        ...user,
        image_url: request.signUrl.public_url,
      } as Required<NonNullable<typeof user>>);

      showToast("Wajah berhasil di daftarkan", "success");
      router.replace("/(tabs)/home");
    },
    onError(err) {
      showToast(err.message, "error");
    },
  });
};
