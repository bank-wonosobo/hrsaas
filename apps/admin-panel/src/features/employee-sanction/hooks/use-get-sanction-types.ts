import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { SanctionType } from "../schemas/employee-sanction-schema";
import { getSanctionTypes } from "../services/get-sanction-types";

export const useGetSanctionTypes = () => {
  return useQuery<PaginatedData<SanctionType>>({
    queryKey: ["sanction-types"],
    queryFn: getSanctionTypes,
    retry: 2,
  });
};
