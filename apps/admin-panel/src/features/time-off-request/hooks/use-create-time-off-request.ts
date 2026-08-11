import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateTimeOffRequest } from "../schemas/time-off-schema";
import { createTimeOffRequest } from "../services/create-time-off-request";

export function useCreateTimeOffRequest(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employee_id, ...data }: CreateTimeOffRequest) =>
      createTimeOffRequest(employee_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["time-off-requests"],
        exact: false,
      });
      toast.success("Pengajuan cuti berhasil dibuat.");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
