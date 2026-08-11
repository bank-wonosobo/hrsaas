import Camera from "@/components/shared/camera";
import { useRegisterFace } from "@/hooks/attendance/use-register-face";
import { useGenerateSignUrl } from "@/hooks/upload/generate-sign-url";
import { PhotoResult } from "@/schema/photo-schema";
import { useEffect } from "react";

export default function AttendanceRegisterFacePage() {
  const generateSignUrl = useGenerateSignUrl();
  const regFaceMutation = useRegisterFace();

  useEffect(() => {
    generateSignUrl.mutate({ mime_type: "image/jpeg", is_public: true });
  }, []);

  const handleCapture = (photo: PhotoResult) => {
    if (!generateSignUrl.data) {
      if (generateSignUrl.isError) {
        generateSignUrl.mutate({ mime_type: "image/jpeg", is_public: true });
      }
      return;
    }

    regFaceMutation.mutate({ photo, signUrl: generateSignUrl.data });
  };

  return (
    <Camera
      facing="front"
      onCapture={handleCapture}
      loading={regFaceMutation.isPending || generateSignUrl.isPending}
    />
  );
}
