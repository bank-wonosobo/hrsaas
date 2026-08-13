import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import { Attendance, ClockInReq } from "@/schema/attendance-schema";
import { PhotoResult } from "@/schema/photo-schema";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const clockInService = async (
  payload: ClockInReq,
  photo: PhotoResult,
): Promise<ResponseData<Attendance>> => {
  const deviceInfo = `${Constants.deviceName ?? "Unknown"} - ${Platform.OS} ${Platform.Version}`;

  const formData = new FormData();
  formData.append("lat", String(payload.lat));
  formData.append("lng", String(payload.lng));
  formData.append("device_info", deviceInfo);
  formData.append("is_allowed", "true");
  formData.append("file", {
    uri: photo.uri,
    name: `attendance-${Date.now()}.jpg`,
    type: photo.mimeType || "image/jpeg",
  } as any);

  const response = await api.post("/attendances/check-in", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Gagal melakukan check-in",
    );
  }

  return response.data;
};
