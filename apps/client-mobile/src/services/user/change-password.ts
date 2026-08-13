import { api } from "@/lib/axios";
import { ChangePasswordRequest } from "@/schema/user-schema";

export const changePassword = async (
  payload: ChangePasswordRequest,
): Promise<void> => {
  const response = await api.patch("/users/_change-password", payload);

  if (response.status !== 200) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Gagal mengubah password",
    );
  }
};
