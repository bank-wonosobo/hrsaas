import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import { CreateRole, Role, RoleSchema } from "../schemas/role-schema";

export const createRole = async (
  request: CreateRole,
): Promise<ResponseData<Role>> => {
  const response = await api.post("/roles", {
    name: request.name,
    permissions: [],
  });

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat role");
  }

  const role = RoleSchema.parse(response.data.data);

  return { ...response.data, data: role };
};
