import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { EmployeeEducation, SearchEmployeeEducation } from "../schemas/employee-education-schema";
import { getEmployeeEducations } from "../services/get-employee-education";

export function useGetEmployeeEducation(search: SearchEmployeeEducation) {
  return useQuery<PaginatedData<EmployeeEducation>>({
    queryKey: ["employee-educations", search],
    queryFn: () => getEmployeeEducations(search),
    enabled: !!search.employee_id,
    placeholderData: (prev) => prev,
  });
}
