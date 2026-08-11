import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { approvePayroll, rejectPayroll } from "../services/payroll-service";

type Decision = { decision: "APPROVE"; notes?: never } | { decision: "REJECT"; notes: string };

export function useDecidePayroll(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Decision) =>
      input.decision === "APPROVE"
        ? approvePayroll(id)
        : rejectPayroll(id, { notes: input.notes }),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"], exact: false });
      toast.success(
        input.decision === "APPROVE"
          ? "Payroll berhasil disetujui."
          : "Payroll berhasil ditolak.",
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
