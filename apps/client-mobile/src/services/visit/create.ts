import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import { CreateVisitRequest, Visit } from "@/schema/visit-schema";

export const createVisitService = async (
  payload: CreateVisitRequest,
): Promise<ResponseData<Visit>> => {
  const response = await api.post("/visits/", payload);

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      response.data?.error ||
        response.data?.message ||
        "Gagal membuat kunjungan",
    );
  }

  return response.data;
};
