import { api } from "@/lib/axios";
import { CheckFaceRes } from "@/schema/attendance-schema";

export const checkFace = async (): Promise<CheckFaceRes> => {
  const response = await api.get("/attendances/_current/face");

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal check face");
  }

  return response.data.data;
};
