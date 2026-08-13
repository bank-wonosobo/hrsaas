import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";

import {
  EmployeeSanction,
  SearchEmployeeSanctionRequest,
} from "../schemas/employee-sanction-schema";
import { searchSanction } from "../services/search-sanction";

export function useSearchSanction(search: SearchEmployeeSanctionRequest) {
  return useQuery<PaginatedData<EmployeeSanction>>({
    queryKey: ["employee-sanctions", search],
    queryFn: async () => searchSanction(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
