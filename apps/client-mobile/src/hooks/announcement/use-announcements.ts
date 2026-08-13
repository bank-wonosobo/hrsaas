import {
  ListAnnouncementParams,
  listAnnouncements,
} from "@/services/announcement/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useAnnouncements(params: ListAnnouncementParams) {
  return useQuery({
    queryKey: ["announcements", "list", params],
    queryFn: () => listAnnouncements(params),
    placeholderData: keepPreviousData,
  });
}
