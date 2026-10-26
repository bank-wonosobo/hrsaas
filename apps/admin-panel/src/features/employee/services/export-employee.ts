import { api } from "@/lib/axios";

export async function exportEmployee(key?: string): Promise<Blob> {
  const response = await api.get("/employees/_export", {
    params: { key: key?.trim() || undefined },
    responseType: "blob",
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error("Gagal mengunduh data karyawan.");
  }

  return response.data;
}
