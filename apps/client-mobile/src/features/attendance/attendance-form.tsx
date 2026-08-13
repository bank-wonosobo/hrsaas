import Camera from "@/components/shared/camera";
import { useZodForm } from "@/hooks/common/use-form";
import { ClockInReq, ClokInReqSchema } from "@/schema/attendance-schema";
import { PhotoResult } from "@/schema/photo-schema";
import { ShieldCheck } from "lucide-react-native";
import { Text, View } from "react-native";

interface Props {
  coordinate: {
    lat: number;
    lng: number;
  };
  loading?: boolean;
  onSubmit(data: ClockInReq, photo: PhotoResult): void | Promise<void>;
}

export default function AttendanceForm({
  coordinate,
  loading,
  onSubmit,
}: Props) {
  const form = useZodForm(ClokInReqSchema, {
    defaultValues: {
      lat: coordinate.lat,
      lng: coordinate.lng,
      is_allowed: true,
      device_info: "-",
    },
  });

  const handleCapture = async (photo: PhotoResult) => {
    const valid = await form.trigger();

    if (!valid) return;

    await onSubmit(form.getValues(), photo);
  };

  return (
    <Camera
      facing="front"
      loading={loading}
      onCapture={handleCapture}
      overlay={
        <View className="absolute inset-0 justify-between gap-4 bg-black/20 px-6 py-14">
          {/* Face Frame */}
          <View className="items-center justify-center h-full ">
            <View className="h-84 w-64 items-center justify-center">
              <View className="h-80 w-64 rounded-[140px] border-2 border-white/60 border-dashed" />

              {/* Scan corner brackets */}
              <View className="absolute top-0 left-2 h-8 w-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <View className="absolute top-0 right-2 h-8 w-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <View className="absolute bottom-0 left-2 h-8 w-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <View className="absolute bottom-0 right-2 h-8 w-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
            </View>

            <View className="mt-6 flex-row items-center rounded-full bg-green-500/20 border border-green-400/30 px-4 py-2">
              <ShieldCheck size={18} color="#4ADE80" />

              <Text className="ml-2 text-sm font-poppins-medium text-green-300">
                Pastikan wajah terlihat jelas
              </Text>
            </View>
          </View>
        </View>
      }
    />
  );
}
