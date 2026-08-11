import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { SanctionType } from "../schemas/employee-sanction-schema";

export const getSanctionTypes = async (): Promise<PaginatedData<SanctionType>> => {
  const response = await api.get("/sanctions", {
    params: { page: 1, size: 100 },
  });
  return { ...response.data, data: response.data.data };
};
