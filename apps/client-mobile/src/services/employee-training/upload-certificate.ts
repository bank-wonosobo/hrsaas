import { generateSignUrl } from "@/services/upload/generate-sign-url";
import { uploadSignUrl } from "@/services/upload/upload-sign-url";
import { EmployeeTrainingCertificate } from "./types";

export const uploadEmployeeTrainingCertificate = async (
  file: EmployeeTrainingCertificate,
): Promise<string> => {
  const signedUrl = await generateSignUrl({
    mime_type: file.mimeType,
    is_public: true,
  });

  await uploadSignUrl(signedUrl.upload_url, file);
  return signedUrl.public_url;
};
