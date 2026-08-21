import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "device_id";

// Persists a random UUID as this installation's stable device identifier,
// since neither iOS nor Android expose one without extra native modules.
export async function getDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}