import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import { Role, RoleSchema } from "../schemas/role-schema";

export const assignPermissions = async (
  roleId: string,
  permissions: string[],
): Promise<ResponseData<Role>> => {
  const response = await api.patch(`/roles/${roleId}/_assign-permissions`, {
    permissions,
  });

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal mengassign permissions");
  }

  const role = RoleSchema.parse(response.data.data);

  return { ...response.data, data: role };
};
