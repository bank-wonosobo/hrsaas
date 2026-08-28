import { api } from "@/lib/axios";

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (response.status !== 200) {
    throw new Error(response.data?.error ?? "Gagal mengupload file");
  }

  return response.data.data.url as string;
}

type GenerateUploadUrlResponse = {
  data: {
    upload_url: string;
    object_key: string;
    public_url: string;
  };
};

export async function uploadFileWithSignedUrl(
  file: File,
  isPublic = false,
): Promise<string> {
  const response = await api.post<GenerateUploadUrlResponse>(
    "/upload/generate-url",
    { mime_type: file.type, is_public: isPublic },
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error("Gagal membuat URL upload");
  }

  const uploadData = response.data?.data;
  if (!uploadData?.upload_url || !uploadData.object_key) {
    throw new Error("Respons URL upload tidak valid");
  }

  const { upload_url, object_key, public_url } = uploadData;
  const uploadResponse = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Gagal mengupload file");
  }

  return isPublic ? public_url : object_key;
}
