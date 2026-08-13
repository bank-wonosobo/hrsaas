import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { Announcement } from "@/schema/announcement-schema";

export type ListAnnouncementParams = {
  title?: string;
  category?: string;
  page?: number;
  size?: number;
};

export const listAnnouncements = async (
  params: ListAnnouncementParams,
): Promise<PaginatedData<Announcement>> => {
  const response = await api.get("/announcements", { params });

  if (response.status !== 200) {
    throw new Error(response.data?.error || "Gagal memuat pengumuman");
  }

  return {
    data: response.data.data,
    paging: response.data.paging,
  };
};
