import { api } from "@/lib/axios";
import { RegisterFaceRes } from "@/schema/attendance-schema";

export const registerFace = async (
  object_key: string,
): Promise<RegisterFaceRes> => {
  const response = await api.post("/attendances/_current/register-face", {
    object_key,
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      response.data?.error || response.data?.message || "Gagal register wajah",
    );
  }

  return response.data;
};
