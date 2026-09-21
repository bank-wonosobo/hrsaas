import Camera from "@/components/shared/camera";
import Button from "@/components/ui/button";
import { useRegisterFace } from "@/hooks/attendance/use-register-face";
import { useGenerateSignUrl } from "@/hooks/upload/generate-sign-url";
import { PhotoResult } from "@/schema/photo-schema";
import { Camera as ExpoCamera, useCameraPermissions } from "expo-camera";
import { CameraOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, Text, View } from "react-native";
export default function AttendanceRegisterFacePage() {
  const generateSignUrl = useGenerateSignUrl();
  const regFaceMutation = useRegisterFace();
  const [permission] = useCameraPermissions();
  const [permissionStatus, setPermissionStatus] =
    useState<typeof permission>(null);
  const [showCamera, setShowCamera] = useState(false);

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

  const handleContinue = async () => {
    const result = permission?.granted
      ? permission
      : await ExpoCamera.requestCameraPermissionsAsync();

    setPermissionStatus(result);
    setShowCamera(result.granted);
  };

  if (!showCamera) {
    const currentPermission = permissionStatus ?? permission;

    if (
      currentPermission &&
      !currentPermission.granted &&
      currentPermission.canAskAgain === false
    ) {
      return (
        <View style={{ flex: 1 }} className="items-center justify-center gap-5 px-6">
          <CameraOff size={40} color="#364153" />
          <Text className="font-poppins-semibold text-center text-lg text-text">
            Akses Kamera Diperlukan
          </Text>
          <Text className="font-poppins-regular text-center text-md text-text">
            Akses kamera diperlukan untuk mengambil foto wajah. Silakan aktifkan
            akses kamera melalui Settings.
          </Text>
          <Button onPress={() => Linking.openSettings()} fullWidth={false}>
            Buka Pengaturan
          </Button>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }} className="items-center justify-center gap-5 px-6">
        <CameraOff size={40} color="#364153" />
        <Text className="font-poppins-semibold text-center text-lg text-text">
          Pendaftaran Wajah
        </Text>
        <Text className="font-poppins-regular text-center text-md text-text">
          Untuk mendaftarkan wajah Anda, aplikasi perlu menggunakan kamera untuk
          mengambil foto wajah Anda.
        </Text>
        <Button onPress={handleContinue} fullWidth={false}>
          Lanjutkan
        </Button>
      </View>
    );
  }

  return (
    <Camera
      facing="front"
      onCapture={handleCapture}
      loading={regFaceMutation.isPending || generateSignUrl.isPending}
    />
  );
}
