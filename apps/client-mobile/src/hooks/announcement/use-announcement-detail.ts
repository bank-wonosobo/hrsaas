import { getAnnouncementDetail } from "@/services/announcement/detail";
import { useQuery } from "@tanstack/react-query";

export function useAnnouncementDetail(id: string) {
  return useQuery({
    queryKey: ["announcements", "detail", id],
    queryFn: () => getAnnouncementDetail(id),
    enabled: !!id,
  });
}
