import { api } from "@/lib/axios";
import { PaginatedData, ResponseData } from "@/lib/response";
import {
  Announcement,
  CreateAnnouncement,
  SearchAnnouncementRequest,
} from "../schemas/announcement-schema";

function assertSuccess(response: { status: number; data?: { error?: string } }, fallback: string) {
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.data?.error || fallback);
  }
}

export async function searchAnnouncements(
  search: SearchAnnouncementRequest,
): Promise<PaginatedData<Announcement>> {
  const response = await api.get("/announcements", {
    params: { key: search.key, page: search.page, size: search.size },
  });
  assertSuccess(response, "Gagal memuat pengumuman");
  return response.data?.data?.data ? response.data.data : response.data;
}

export async function createAnnouncement(
  request: CreateAnnouncement,
): Promise<ResponseData<Announcement>> {
  const response = await api.post("/announcements", request);
  assertSuccess(response, "Gagal membuat pengumuman");
  return response.data;
}

export async function updateAnnouncement(
  id: string,
  request: CreateAnnouncement,
): Promise<ResponseData<Announcement>> {
  const response = await api.put(`/announcements/${id}`, request);
  assertSuccess(response, "Gagal mengubah pengumuman");
  return response.data;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const response = await api.delete(`/announcements/${id}`);
  assertSuccess(response, "Gagal menghapus pengumuman");
}
