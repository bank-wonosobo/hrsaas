import {
  ListEmployeeTrainingParams,
  listEmployeeTrainings,
} from "@/services/employee-training/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useEmployeeTrainings(params: ListEmployeeTrainingParams) {
  return useQuery({
    queryKey: ["employee-trainings", "current", params],
    queryFn: () => listEmployeeTrainings(params),
    placeholderData: keepPreviousData,
  });
}
