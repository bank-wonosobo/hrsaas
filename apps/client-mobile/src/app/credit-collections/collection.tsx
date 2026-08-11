import { useToast } from "@/context/toast-context";
import CaptureCollection from "@/features/credit-collection/capture-collection";
import FormCollection from "@/features/credit-collection/form-collection";
import MapCollection from "@/features/credit-collection/map-collection";
import { useLocation } from "@/hooks/common/use-location";
import { useCreditCollectionVisit } from "@/hooks/credit-collection/visit";
import { useGenerateSignUrl } from "@/hooks/upload/generate-sign-url";
import {
  CreditCollectionVisit,
  CreditCustomer,
} from "@/schema/credit-collection-schema";
import { PhotoResult } from "@/schema/photo-schema";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function CollectionPage() {
  const { customerCredit } = useLocalSearchParams<{
    customerCredit: string;
  }>();
  const {
    coor,
    address,
    loading: loadingLocation,
    error: locationError,
  } = useLocation();
  const generateSignUrl = useGenerateSignUrl();
  const visitMutate = useCreditCollectionVisit();
  const [photo, setPhoto] = useState<PhotoResult>();
  const { showToast } = useToast();

  useEffect(() => {
    generateSignUrl.mutate({ mime_type: "image/jpeg", is_public: false });
  }, []);

  const creditCustomer: CreditCustomer | undefined = customerCredit
    ? JSON.parse(customerCredit)
    : undefined;

  const handleSubmit = async (data: CreditCollectionVisit) => {
    if (!generateSignUrl.data) {
      if (generateSignUrl.isError) {
        generateSignUrl.mutate({ mime_type: "image/jpeg", is_public: false });
      }
      return;
    }
    if (!photo) {
      showToast("Bukti kunjungan wajib diisi", "error");
      return;
    }

    visitMutate.mutate({ visit: data, photo, signUrl: generateSignUrl.data });
  };

  return (
    <>
      <ScrollView className="flex-1 p-4">
        {creditCustomer ? (
          <View className="gap-3">
            {/* <DetailNasabah creditCutomer={creditCustomer} /> */}
            {loadingLocation ? (
              <View className="m-4">
                <ActivityIndicator color="#000" />
              </View>
            ) : coor ? (
              <>
                <MapCollection coor={coor} address={address} />
                <CaptureCollection onCapture={(photo) => setPhoto(photo)} />

                <FormCollection
                  imageUrl={generateSignUrl.data?.object_key || ""}
                  loading={visitMutate.isPending}
                  creditCustomer={creditCustomer}
                  location={coor}
                  onSubmit={handleSubmit}
                />
              </>
            ) : null}
          </View>
        ) : (
          <View className="bg-white p-4">
            <Text className="font-poppins-medium">Nasabah tidak ditemukan</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}
