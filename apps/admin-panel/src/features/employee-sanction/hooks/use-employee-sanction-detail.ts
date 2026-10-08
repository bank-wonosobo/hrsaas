import { useQuery } from "@tanstack/react-query";
import { getEmployeeSanctionById } from "../services/create-employee-sanction";

export function useEmployeeSanctionDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: ["employee-sanction", id],
    queryFn: () => getEmployeeSanctionById(id),
    enabled: enabled && !!id,
  });
}
