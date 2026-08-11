import { ResponseData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { OfficeLocation } from "../schemas/office-location-schema";
import { getOfficeLocationById } from "../services/office-location-service";

export function useDetailOfficeLocation(id: string) {
  return useQuery<ResponseData<OfficeLocation>>({
    queryKey: ["office-locations", id],
    queryFn: () => getOfficeLocationById(id),
    enabled: !!id,
    retry: 2,
  });
}
