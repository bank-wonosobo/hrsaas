import Alert from "@/components/ui/alert";
import Button from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

import AttendanceMap from "@/features/attendance/attendance-map";

import AttendanceProfile from "@/features/attendance/attendance-profile";
import AttendanceShif from "@/features/attendance/attendance-shift";
import { useCheckFace } from "@/hooks/attendance/use-check-face";
import { useLocation } from "@/hooks/common/use-location";
import { useCurrentShift } from "@/hooks/shift/use-current";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScanFace, ShieldAlert } from "lucide-react-native";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function AttendaceArea() {
  const { type } = useLocalSearchParams<{
    type: string;
  }>();
  const { data: checkFace, isLoading: loadingCheckFace } = useCheckFace();
  const { data: shifts } = useCurrentShift();
  const { user } = useAuth();
  const router = useRouter();
  const {
    coor,
    address,
    loading: loadingLocation,
    error: locationError,
  } = useLocation();

  const currentShiftDay = shifts?.data[0]?.shift_days[0];

  if (loadingCheckFace) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 animate-pulse">
        <ActivityIndicator color="#000" />
        <Text className="text-md font-poppins-regular">
          Tunggu Sebentar , sedang mencari wajah anda...
        </Text>
      </View>
    );
  }

  if (!checkFace?.registered) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <View className="w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <View className="mb-6 self-center rounded-full bg-amber-100 p-5">
            <ShieldAlert size={48} color="#F59E0B" />
          </View>

          <Text className="text-center text-2xl font-bold text-gray-900">
            Face Belum Terdaftar
          </Text>

          <Text className="mt-3 text-center text-base leading-6 text-gray-500">
            Anda belum memiliki data pengenalan wajah. Silakan daftarkan wajah
            terlebih dahulu agar dapat melakukan absensi menggunakan Face
            Recognition.
          </Text>

          <View className="mt-8 rounded-2xl bg-blue-50 p-4">
            <View className="flex-row items-center">
              <ScanFace size={20} color="#2563EB" />
              <Text className="ml-2 flex-1 text-sm text-blue-700">
                Pastikan wajah terlihat jelas, pencahayaan cukup, dan tidak
                menggunakan penutup wajah saat proses pendaftaran.
              </Text>
            </View>
          </View>

          <Button
            className="mt-8"
            onPress={() => {
              // Navigate ke halaman registrasi face
              router.push("/attendances/register-face");
            }}
          >
            Daftarkan Wajah
          </Button>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView>
        <View className="h-100">
          <AttendanceMap
            coor={coor}
            address={address}
            loading={loadingLocation}
          />
        </View>

        <View className="px-6 pb-30 bg-white relative -top-2 rounded-xl">
          <Text className="font-poppins-semibold text-md mb-2 mt-4">
            Profile
          </Text>
          {user && <AttendanceProfile user={user} />}
          <Text className="font-poppins-semibold text-md my-2">
            Shif Karyawan
          </Text>
          {currentShiftDay ? (
            <AttendanceShif
              shiftDay={currentShiftDay}
              attendanceType={type === "check-in" ? "IN" : "OUT"}
            />
          ) : (
            <Alert variant="warning">Shift tidak ditemukan</Alert>
          )}
        </View>
      </ScrollView>
      <View className="absolute w-full bottom-0 p-5 bg-white border-t border-gray-200 ">
        <Button
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/attendances/selfie",
              params: { lat: coor?.lat, lng: coor?.lng, type },
            })
          }
          disabled={loadingLocation}
        >
          Selfi untuk Presesnsi
        </Button>
      </View>
    </>
  );
}
