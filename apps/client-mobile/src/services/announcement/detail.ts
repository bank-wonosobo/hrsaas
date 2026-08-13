import { api } from "@/lib/axios";
import { Announcement } from "@/schema/announcement-schema";

export const getAnnouncementDetail = async (
  id: string,
): Promise<Announcement> => {
  const response = await api.get(`/announcements/${id}`);

  if (response.status !== 200) {
    throw new Error(response.data?.error || "Gagal memuat detail pengumuman");
  }

  return response.data.data;
};
