import * as SecureStore from "expo-secure-store";
import * as Application from "expo-application";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "device_id";

function createDeviceId(): string {
  const bytes = new Uint8Array(16);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return [...bytes]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}

let deviceIdPromise: Promise<string> | undefined;

export function getDeviceId(): Promise<string> {
  if (!deviceIdPromise) {
    deviceIdPromise = resolveDeviceId();
  }
  return deviceIdPromise;
}

async function resolveDeviceId(): Promise<string> {
  if (Platform.OS === "android") {
    return Application.getAndroidId();
  }

  if (Platform.OS === "ios") {
    const iosId = await Application.getIosIdForVendorAsync();
    if (iosId) {
      return iosId;
    }
  }

  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = createDeviceId();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}
