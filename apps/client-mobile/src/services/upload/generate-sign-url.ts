import { api } from "@/lib/axios";
import { GenerateSignUrl, SignUrl } from "@/schema/upload-schema";

export const generateSignUrl = async (
  request: GenerateSignUrl,
): Promise<SignUrl> => {
  const response = await api.post("/generate-url", {
    mime_type: request.mime_type,
    is_public: request.is_public,
  });

  if (response.status !== 200) {
    throw new Error(response.data.error || "Generate failed");
  }

  return response.data.data;
};
