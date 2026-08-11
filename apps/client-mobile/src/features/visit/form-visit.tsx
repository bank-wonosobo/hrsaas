import Button from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { useZodForm } from "@/hooks/common/use-form";
import { useLocation } from "@/hooks/common/use-location";
import { useGenerateSignUrl } from "@/hooks/upload/generate-sign-url";
import { useCreateVisit } from "@/hooks/visit/use-create-visit";
import { PhotoResult } from "@/schema/photo-schema";
import { VisitForm, VisitFormSchema } from "@/schema/visit-schema";
import { useLocalSearchParams } from "expo-router";
import { MapPin } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import CaptureVisit from "./capture-visit";
import MapVisit from "./map-visit";

export default function FormVisit() {
  const { visit_type, client_name: defaultClientName } = useLocalSearchParams<{
    visit_type?: string;
    client_name?: string;
  }>();
  const { showToast } = useToast();
  const {
    coor,
    address,
    loading: loadingLocation,
    error: locationError,
  } = useLocation();
  const generateSignUrl = useGenerateSignUrl();
  const { mutate: createVisit, isPending } = useCreateVisit();
  const [photo, setPhoto] = useState<PhotoResult | null>(null);

  useEffect(() => {
    generateSignUrl.mutate({ mime_type: "image/jpeg", is_public: false });
  }, []);

  const isOut = visit_type === "OUT";

  const form = useZodForm(VisitFormSchema, {
    defaultValues: {
      visit_type: isOut ? "OUT" : "IN",
      client_name: defaultClientName ?? "",
      note: "",
    },
  });

  const onSubmit = (data: VisitForm) => {
    if (!photo) {
      showToast("Silakan ambil foto terlebih dahulu", "error");
      return;
    }
    if (!coor) {
      showToast("Lokasi belum tersedia", "error");
      return;
    }
    if (!generateSignUrl.data) {
      if (generateSignUrl.isError) {
        generateSignUrl.mutate({ mime_type: "image/jpeg", is_public: false });
      }
      return;
    }

    createVisit({
      visit: {
        ...data,
        latitude: String(coor.lat),
        longitude: String(coor.lng),
        address,
      },
      photo,
      signUrl: generateSignUrl.data,
    });
  };

  return (
    <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
      <View className="gap-3">
        <CaptureVisit
          photo={photo}
          onCapture={setPhoto}
          onRemove={() => setPhoto(null)}
        />

        {coor ? (
          <MapVisit coor={coor} address={address} />
        ) : (
          <View className="bg-white p-4 rounded-xl gap-2">
            <Text className="font-poppins-medium">Lokasi</Text>
            <View className="flex-row items-start gap-2 border border-gray-200 rounded-xl p-3 bg-gray-50">
              <MapPin size={16} color="#3f9aae" />
              <Text className="flex-1 font-poppins-regular text-xs text-gray-600">
                {loadingLocation
                  ? "Sedang mengambil lokasi..."
                  : "Lokasi belum tersedia"}
              </Text>
            </View>
          </View>
        )}
        {!!locationError && (
          <Text className="text-xs text-red-500">{locationError}</Text>
        )}

        <View className="bg-white p-4 rounded-xl">
          <Controller
            control={form.control}
            name="client_name"
            render={({ field, fieldState }) => (
              <FormField
                label="Nama Client"
                required
                error={fieldState.error?.message}
              >
                <Input
                  placeholder="Nama client yang dikunjungi"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.invalid}
                />
              </FormField>
            )}
          />

          <Controller
            control={form.control}
            name="note"
            render={({ field, fieldState }) => (
              <FormField
                label="Catatan"
                required
                error={fieldState.error?.message}
              >
                <Input
                  placeholder="Tulis catatan kunjungan"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.invalid}
                  multiline
                  numberOfLines={4}
                  className="min-h-[100px]"
                  textAlignVertical="top"
                />
              </FormField>
            )}
          />

          <Button
            loading={isPending}
            variant="secondary"
            fullWidth
            onPress={form.handleSubmit(onSubmit)}
          >
            {isOut ? "Selesai Kunjungan" : "Mulai Kunjungan"}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
