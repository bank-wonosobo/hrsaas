import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ActionTimeOffApproval } from "../schemas/time-off-approval-schema";
import { actionTimeOffApproval } from "../services/action-time-off-approval";

export const useActionTimeOffApproval = (id: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: ActionTimeOffApproval) =>
      await actionTimeOffApproval(id, request),
    onSuccess: async () => {
      // Simpan token ke localStorage atau state management
      queryClient.invalidateQueries({
        queryKey: ["time-off-approvals"],
        exact: false,
      });
      toast.success("Berhasil.");
      router.push("/time-off-approvals"); // Redirect ke dashboard atau halaman utama
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
