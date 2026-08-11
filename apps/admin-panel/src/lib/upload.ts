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
