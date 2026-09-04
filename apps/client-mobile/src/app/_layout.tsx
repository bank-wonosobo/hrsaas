import BackButton from "@/components/shared/back-bottom";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { NotificationProvider } from "@/context/notification-context";
import { ToastProvider } from "@/context/toast-context";
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { useFonts } from "@expo-google-fonts/poppins";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { KeyboardAvoidingView, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css"; //

const queryClient = new QueryClient();

function RootNavigation() {
  const { token, loading } = useAuth();

  if (loading) {
    return null; // atau SplashScreen
  }

  return (
    <ToastProvider>
      <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="dark-content" />

          <Stack
            screenOptions={{
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontFamily: "Poppins_500Medium",
              },
              headerShadowVisible: false,
              headerLeft: () => <BackButton />,
            }}
          >
            <Stack.Protected guard={!!token}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="attendances"
                options={{ title: "Presensi Karyawan" }}
              />
              <Stack.Screen
                name="attendances/area"
                options={{ title: "Area Presensi" }}
              />
              <Stack.Screen
                name="attendances/selfie"
                options={{ title: "Presensi" }}
              />
              <Stack.Screen
                name="attendances/register-face"
                options={{ title: "Daftarkan Wajah" }}
              />
              <Stack.Screen
                name="time-offs/index"
                options={{ title: "Izin & Cuti" }}
              />
              <Stack.Screen
                name="time-offs/create"
                options={{ title: "Pengajuan Izin & Cuti" }}
              />
              <Stack.Screen
                name="time-off-approvals/index"
                options={{ title: "Persetujuan Cuti" }}
              />
              <Stack.Screen
                name="visits/index"
                options={{ title: "Kunjungan Client" }}
              />
              <Stack.Screen
                name="visits/create"
                options={{ title: "Kunjungan Client" }}
              />
              <Stack.Screen
                name="sanctions/index"
                options={{ title: "Sanksi Karyawan" }}
              />
              <Stack.Screen
                name="salary/index"
                options={{ title: "Slip Gaji" }}
              />
              <Stack.Screen
                name="profile/personal"
                options={{ title: "Data Diri" }}
              />
              <Stack.Screen
                name="profile/contracts"
                options={{ title: "Riwayat Kontrak" }}
              />
              <Stack.Screen
                name="profile/education"
                options={{ title: "Pendidikan dan Pelatihan" }}
              />
              <Stack.Screen
                name="profile/change-password"
                options={{ title: "Ubah Kata Sandi" }}
              />
              <Stack.Screen
                name="announcements/index"
                options={{ title: "Pengumuman" }}
              />
              <Stack.Screen
                name="announcements/[id]"
                options={{ title: "Detail Pengumuman" }}
              />
              <Stack.Screen
                name="credit-collections/index"
                options={{
                  title: "Penagihan Kredit",
                }}
              />
              <Stack.Screen
                name="credit-collections/search"
                options={{
                  title: "Cari Kredit",
                }}
              />
              <Stack.Screen
                name="credit-collections/collection"
                options={{ title: "Penagihan" }}
              />
              <Stack.Screen
                name="employee-docs/index"
                options={{ title: "Dokumen Karyawan" }}
              />
              <Stack.Screen
                name="employees/index"
                options={{ title: "Data Karyawan" }}
              />
            </Stack.Protected>

            <Stack.Protected guard={!token}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        </QueryClientProvider>
      </SafeAreaView>
    </ToastProvider>
  );
}

export default function RootLayout() {
  // load fonts
  useLoadFonts();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <AuthProvider>
        <NotificationProvider>
          <RootNavigation />
        </NotificationProvider>
      </AuthProvider>
    </KeyboardAvoidingView>
  );
}

function useLoadFonts() {
  const [loaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  if (!loaded) {
    return null;
  }

  return null;
}
