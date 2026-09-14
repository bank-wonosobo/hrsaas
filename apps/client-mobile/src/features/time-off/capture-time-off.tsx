import Camera from "@/components/shared/camera";
import { PhotoResult } from "@/schema/photo-schema";
import { CameraIcon, X } from "lucide-react-native";
import { useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";

interface Props {
  photo: PhotoResult | null;
  onCapture(photo: PhotoResult): void;
  onRemove(): void;
}

export default function CaptureTimeOff({ photo, onCapture, onRemove }: Props) {
  const [cameraVisible, setCameraVisible] = useState(false);

  return (
    <View className="bg-white p-4 rounded-xl border border-gray-200">
      <Text className="font-poppins-medium">Bukti Cuti / Izin</Text>
      <Text className="mt-1 text-xs text-gray-500">
        Foto bukti cuti / izin dapat dilampirkan sebagai keterangan tambahan (opsional).
      </Text>
      <View className="flex-row mt-2">
        {photo ? (
          <View className="h-24 w-24 overflow-hidden rounded-lg">
            <Image source={{ uri: photo.uri }} className="h-full w-full" />
            <Pressable
              accessibilityLabel="Hapus foto"
              className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/60"
              onPress={onRemove}
            >
              <X color="white" size={14} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            className="h-24 w-24 items-center justify-center border border-dashed border-gray-300 rounded-lg active:scale-95"
            onPress={() => setCameraVisible(true)}
          >
            <CameraIcon color="#9ca3af" />
          </Pressable>
        )}
      </View>
      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >
        <Camera
          facing="back"
          onCapture={(result) => {
            onCapture(result);
            setCameraVisible(false);
          }}
          overlay={
            <View className="absolute top-14 left-4">
              <Pressable
                onPress={() => setCameraVisible(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
              >
                <X color="white" size={20} />
              </Pressable>
            </View>
          }
        />
      </Modal>
    </View>
  );
}
