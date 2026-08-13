import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { bulkAssignEmployeesToShift } from "../services/shift-service";

interface BulkAssignPayload {
  shiftId: string;
  employeeIds: string[];
}

export function useBulkAssignEmployeesShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, employeeIds }: BulkAssignPayload) =>
      bulkAssignEmployeesToShift(shiftId, employeeIds),
    onSuccess: () => {
      toast.success("Berhasil mengassign karyawan ke shift.");
      queryClient.invalidateQueries({ queryKey: ["shifts"], exact: false });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
