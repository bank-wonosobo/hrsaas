import { api } from "@/lib/axios";
import { ActionTimeOffApproval } from "@/schema/time-off-approval-schema";

export const actionTimeOffApproval = async (
  id: string,
  payload: ActionTimeOffApproval,
): Promise<void> => {
  const response = await api.patch(`/time-off-approvals/${id}`, payload);

  if (response.status !== 200) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Gagal memproses persetujuan cuti",
    );
  }
};
