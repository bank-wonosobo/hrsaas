import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  SalaryComponent,
  SearchSalaryComponentRequest,
} from "../schemas/salary-component-schema";
import { getSalaryComponents } from "../services/salary-component-service";

export function useSearchSalaryComponent(search: SearchSalaryComponentRequest) {
  const normalized = {
    key: search.key ?? "",
    type: search.type ?? "",
    active_only: !!search.active_only,
    page: Number(search.page ?? 1),
    size: Number(search.size ?? 10),
  };

  return useQuery<PaginatedData<SalaryComponent>>({
    queryKey: [
      "salary-components",
      normalized.key,
      normalized.type,
      normalized.active_only,
      normalized.page,
      normalized.size,
    ],
    queryFn: () => getSalaryComponents(search),
    placeholderData: (prev) => prev,
  });
}
