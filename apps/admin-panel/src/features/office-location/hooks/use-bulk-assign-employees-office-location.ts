import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bulkAssignEmployeesToOfficeLocation } from "../services/bulk-assign-employees-office-location";

interface BulkAssignPayload {
  officeLocationId: string;
  employeeIds: string[];
}

export function useBulkAssignEmployeesOfficeLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ officeLocationId, employeeIds }: BulkAssignPayload) =>
      bulkAssignEmployeesToOfficeLocation(officeLocationId, employeeIds),
    onSuccess: () => {
      toast.success("Berhasil mengassign karyawan ke lokasi kantor.");
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
