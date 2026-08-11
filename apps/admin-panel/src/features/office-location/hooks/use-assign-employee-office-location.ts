import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { assignEmployeeToOfficeLocation } from "../services/assign-employee-office-location";

interface AssignPayload {
  employeeId: string;
  officeLocationId: string;
}

export function useAssignEmployeeOfficeLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, officeLocationId }: AssignPayload) =>
      assignEmployeeToOfficeLocation(employeeId, officeLocationId),
    onSuccess: () => {
      toast.success("Karyawan berhasil ditambahkan ke lokasi kantor.");
      queryClient.invalidateQueries({
        queryKey: ["office-locations"],
        exact: false,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
