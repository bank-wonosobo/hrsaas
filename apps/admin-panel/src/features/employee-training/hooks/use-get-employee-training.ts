import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { EmployeeTraining, SearchEmployeeTraining } from "../schemas/employee-training-schema";
import { getEmployeeTrainings } from "../services/get-employee-training";

export function useGetEmployeeTraining(search: SearchEmployeeTraining) {
  return useQuery<PaginatedData<EmployeeTraining>>({
    queryKey: ["employee-trainings", search],
    queryFn: () => getEmployeeTrainings(search),
    enabled: !!search.employee_id,
    placeholderData: (prev) => prev,
  });
}
