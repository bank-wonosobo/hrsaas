import {
  ListEmployeeDocumentParams,
  listEmployeeDocuments,
} from "@/services/employee-docs/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useEmployeeDocuments(params: ListEmployeeDocumentParams) {
  return useQuery({
    queryKey: ["employee-docs", "current", params],
    queryFn: () => listEmployeeDocuments(params),
    placeholderData: keepPreviousData,
  });
}
