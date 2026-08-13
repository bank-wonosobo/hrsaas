import Camera from "@/components/shared/camera";
import { PhotoResult } from "@/schema/photo-schema";
import { CameraIcon, X } from "lucide-react-native";
import { useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";

interface Props {
  onCapture?(photo: PhotoResult): void;
}

export default function CaptureCollection({ onCapture }: Props) {
  const [photo, setPhoto] = useState<PhotoResult | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);

  const handleCapture = (result: PhotoResult) => {
    setPhoto(result);
    setCameraVisible(false);
    onCapture?.(result);
  };

  return (
    <View className="bg-white p-4 rounded-xl ">
      <Text className="font-poppins-medium">Bukti Penagihan</Text>
      <View className="flex-row mt-2">
        {photo ? (
          <View className="h-20 w-20 overflow-hidden">
            <Image
              source={{ uri: photo.uri }}
              className="h-full w-full rounded-sm "
            />
            <Pressable
              accessibilityLabel="Hapus foto"
              className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/60"
              onPress={() => setPhoto(null)}
            >
              <X color="white" size={14} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            className="p-3 border border-gray-300 rounded-md active:scale-95 overflow-hidden"
            onPress={() => setCameraVisible(true)}
          >
            <CameraIcon color="#d1d5dc" />
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
          onCapture={handleCapture}
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
