import {
  ListEmployeeEducationParams,
  listEmployeeEducations,
} from "@/services/employee-education/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useEmployeeEducations(params: ListEmployeeEducationParams) {
  return useQuery({
    queryKey: ["employee-educations", "current", params],
    queryFn: () => listEmployeeEducations(params),
    placeholderData: keepPreviousData,
  });
}
