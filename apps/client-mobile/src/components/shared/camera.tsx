import { useCameraCapture } from "@/hooks/common/use-camera-capture";
import { PhotoResult } from "@/schema/photo-schema";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import {
  Camera as CameraIcon,
  CameraOff,
  RefreshCw,
} from "lucide-react-native";
import { ReactNode, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import Button from "../ui/button";

interface CameraProps {
  facing?: CameraType;
  overlay?: ReactNode;
  loading?: boolean;
  onCapture?(photo: PhotoResult): void | Promise<void>;
}

export default function Camera({
  facing = "front",
  overlay,
  loading,
  onCapture,
}: CameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const {
    cameraRef,
    photo,
    capture,
    loading: cameraLoading,
  } = useCameraCapture();
  const [processing, setProcessing] = useState(false);
  const [currentFacing, setCurrentFacing] = useState<CameraType>(facing);

  const handleCapture = async () => {
    const result = await capture();

    if (!result) return;

    try {
      setProcessing(true);
      await onCapture?.(result);
    } finally {
      setProcessing(false);
    }
  };

  if (!permission) {
    return <View style={{ flex: 1 }}></View>;
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1 }} className="items-center justify-center gap-5">
        <CameraOff size={40} color="#364153" />
        <Text className="font-poppins-regular text-md text-center text-text">
          Izin kamera diperlukan
        </Text>
        <Button onPress={requestPermission} fullWidth={false}>
          Izinkan Kamera
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {photo && loading ? (
        <Image
          source={{ uri: photo.uri }}
          style={{
            flex: 1,
            transform: currentFacing === "front" ? [{ scaleX: -1 }] : [],
          }}
        />
      ) : (
        <CameraView
          ref={cameraRef}
          facing={currentFacing}
          style={{ flex: 1 }}
        />
      )}

      {overlay}

      <Pressable
        accessibilityLabel="Ganti kamera depan dan belakang"
        disabled={loading || cameraLoading || processing}
        onPress={() =>
          setCurrentFacing((current) =>
            current === "front" ? "back" : "front",
          )
        }
        className="absolute active:scale-95 bottom-14 right-20 h-12 w-12 items-center justify-center rounded-full bg-black/40"
      >
        <RefreshCw color="white" size={24} />
      </Pressable>
      <View className="absolute bottom-10 self-center">
        <Pressable
          disabled={loading || cameraLoading}
          onPress={handleCapture}
          className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20"
        >
          <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
            {loading || cameraLoading || processing ? (
              <ActivityIndicator />
            ) : (
              <CameraIcon color="#111827" size={28} />
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}
