import { PhotoResult } from "@/schema/photo-schema";
import { CameraView } from "expo-camera";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useCallback, useRef, useState } from "react";

const MAX_DIMENSION = 720;

export function useCameraCapture() {
  const cameraRef = useRef<CameraView>(null);
  const [photo, setPhoto] = useState<PhotoResult | null>(null);
  const [loading, setLoading] = useState(false);

  const capture = useCallback(async (): Promise<PhotoResult | null> => {
    if (!cameraRef.current || loading) return null;

    try {
      setLoading(true);

      const result = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: false,
      });

      const context = ImageManipulator.manipulate(result.uri).resize({
        width: MAX_DIMENSION,
      });
      const rendered = await context.renderAsync();
      const resized = await rendered.saveAsync({
        compress: 0.7,
        format: SaveFormat.JPEG,
      });

      const photo: PhotoResult = {
        uri: resized.uri,
        mimeType: "image/jpeg",
      };

      setPhoto(photo);

      return photo;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const reset = useCallback(() => {
    setPhoto(null);
  }, []);

  return {
    cameraRef,
    photo,
    loading,
    capture,
    reset,
    setPhoto,
  };
}
