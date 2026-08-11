import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  OfficeLocation,
  SearchOfficeLocationRequest,
} from "../schemas/office-location-schema";
import { getOfficeLocations } from "../services/office-location-service";

export function useSearchOfficeLocation(search: SearchOfficeLocationRequest) {
  const normalized = {
    key: search.key ?? "",
    page: Number(search.page),
    size: Number(search.size),
  };
  return useQuery<PaginatedData<OfficeLocation>>({
    queryKey: [
      "office-locations",
      normalized.key,
      normalized.page,
      normalized.size,
    ],
    queryFn: async () => getOfficeLocations(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
