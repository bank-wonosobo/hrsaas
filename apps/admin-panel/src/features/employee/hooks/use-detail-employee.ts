import { ResponseData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { Employee } from "../schemas/employee-schema";
import { getEmployeeById } from "../services/employee-service";

export function useDetailEmployee(id: string) {
  return useQuery<ResponseData<Employee>>({
    queryKey: ["employees", id],
    queryFn: async () => getEmployeeById(id),
    retry: 2,
  });
}
