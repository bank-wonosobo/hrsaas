import { PaginatedData } from "@/lib/response";
import { OfficeLocation } from "@/schema/office-loc-schema";
import { currentOfficeLoc } from "@/services/office-location/current";
import { useQuery } from "@tanstack/react-query";

export const useCurrentOfficeLoc = () =>
  useQuery<PaginatedData<OfficeLocation>>({
    queryKey: ["current-loc"],
    queryFn: () => currentOfficeLoc(),
  });
