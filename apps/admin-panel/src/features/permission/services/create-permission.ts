import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import { CreatePermission, Permission, PermissionSchema } from "../schemas/permission-schema";

export const createPermission = async (
  request: CreatePermission,
): Promise<ResponseData<Permission>> => {
  const response = await api.post("/permissions", request);

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat permission");
  }

  const permission = PermissionSchema.parse(response.data.data);

  return { ...response.data, data: permission };
};
