import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { Announcement, SearchAnnouncementRequest } from "../schemas/announcement-schema";
import { searchAnnouncements } from "../services/announcement-service";

export function useSearchAnnouncement(search: SearchAnnouncementRequest) {
  const normalized = { key: search.key ?? "", page: Number(search.page ?? 1), size: Number(search.size ?? 10) };
  return useQuery<PaginatedData<Announcement>>({
    queryKey: ["announcements", normalized.key, normalized.page, normalized.size],
    queryFn: () => searchAnnouncements(normalized),
    placeholderData: (previous) => previous,
  });
}
