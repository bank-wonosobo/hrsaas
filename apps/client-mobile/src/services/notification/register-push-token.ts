import { api } from "@/lib/axios";
import { getDeviceId } from "@/lib/device-id";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const registerPushTokenService = async (
  expoPushToken: string,
): Promise<void> => {
  const deviceId = await getDeviceId();
  const authToken = await SecureStore.getItemAsync("token");

  const response = await api.post("/devices", {
    push_token: expoPushToken,
    device_id: deviceId,
    app_version: Constants.expoConfig?.version,
    provider: "expo",
    platform: Platform.OS,
    device_name: Device.deviceName ?? undefined,
  }, {
    headers: authToken
      ? { Authorization: `Bearer ${authToken}` }
      : undefined,
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Gagal mendaftarkan push token",
    );
  }
};
