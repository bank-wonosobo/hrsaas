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
import {
  Coffee,
  MapPin,
  ScanFace,
  ShieldAlert,
  TimerOff,
} from "lucide-react-native";
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
  const isBreakAttendance = type === "break-in" || type === "break-out";
  const isBreakIn = type === "break-in";

  if (loadingCheckFace && !isBreakAttendance) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 animate-pulse">
        <ActivityIndicator color="#000" />
        <Text className="text-md font-poppins-regular">
          Tunggu Sebentar , sedang mencari wajah anda...
        </Text>
      </View>
    );
  }

  if (!checkFace?.registered && !isBreakAttendance) {
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
      {isBreakAttendance ? (
        <View className=" bg-orange-50 px-6 pt-20" style={{ flex: 12 }}>
          <View className="items-center rounded-3xl bg-white p-8 shadow-sm">
            <View className="rounded-full bg-orange-100 p-6">
              {isBreakIn ? (
                <Coffee size={52} color="#EA580C" />
              ) : (
                <TimerOff size={52} color="#EA580C" />
              )}
            </View>
            <Text className="mt-6 text-center text-3xl font-poppins-bold text-gray-900">
              {isBreakIn ? "Mulai Istirahat" : "Selesai Istirahat"}
            </Text>
            <Text className="mt-3 text-center text-base leading-6 text-gray-500">
              {isBreakIn
                ? "Ambil waktu untuk beristirahat. Lakukan selfie untuk mencatat waktu mulai istirahat Anda."
                : "Selamat datang kembali. Lakukan selfie untuk mencatat waktu selesai istirahat Anda."}
            </Text>
          </View>

          <View className="mt-5 rounded-2xl bg-white p-4">
            <View className="flex-row items-center">
              <MapPin size={20} color="#EA580C" />
              <View className="ml-3 flex-1">
                <Text className="font-poppins-semibold text-sm text-gray-800">
                  Lokasi Anda
                </Text>
                <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
                  {loadingLocation
                    ? "Sedang mencari lokasi..."
                    : address || "Lokasi tidak ditemukan"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
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
      )}
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
          {isBreakIn
            ? "Selfie untuk Mulai Istirahat"
            : isBreakAttendance
              ? "Selfie untuk Selesai Istirahat"
              : "Selfi untuk Presesnsi"}
        </Button>
      </View>
    </>
  );
}
