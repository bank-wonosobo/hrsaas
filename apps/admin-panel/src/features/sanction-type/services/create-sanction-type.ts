import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import {
  CreateSanctionType,
  SanctionType,
  SanctionTypeSchema,
} from "../schemas/sanction-type-schema";

export const createSanctionType = async (
  request: CreateSanctionType,
): Promise<ResponseData<SanctionType>> => {
  const response = await api.post("/sanctions", request);

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat jenis sanksi");
  }

  const data = SanctionTypeSchema.parse(response.data.data);

  return { ...response.data, data };
};
