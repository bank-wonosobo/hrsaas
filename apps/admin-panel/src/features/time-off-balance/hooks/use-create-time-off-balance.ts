import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateTimeOffBalance } from "../schemas/time-off-balance-schema";
import { createTimeOffBalance } from "../services/time-off-balance-service";

export function useCreateTimeOffBalance(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTimeOffBalance) => createTimeOffBalance(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-balances"], exact: false });
      toast.success("Saldo cuti berhasil disimpan.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
