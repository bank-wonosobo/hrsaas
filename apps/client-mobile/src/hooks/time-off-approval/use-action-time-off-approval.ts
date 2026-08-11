import { useToast } from "@/context/toast-context";
import { ActionTimeOffApproval } from "@/schema/time-off-approval-schema";
import { actionTimeOffApproval } from "@/services/time-off-approval/action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ActionPayload = {
  id: string;
  payload: ActionTimeOffApproval;
};

export const useActionTimeOffApproval = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: ActionPayload) =>
      actionTimeOffApproval(id, payload),
    onSuccess: (_data, { payload }) => {
      queryClient.invalidateQueries({ queryKey: ["time-off-approvals"] });
      showToast(
        payload.action === "APPROVE"
          ? "Cuti berhasil disetujui"
          : "Cuti berhasil ditolak",
        "success",
      );
    },
    onError: (err) => {
      showToast(err.message, "error");
    },
  });
};
