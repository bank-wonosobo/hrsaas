import { api } from "@/lib/axios";
import { Visit } from "@/schema/visit-schema";

export type ListVisitParams = {
  visit_type?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  page?: number;
  size?: number;
};

export const listVisits = async (params: ListVisitParams): Promise<Visit[]> => {
  const response = await api.get("/visits", { params });

  if (response.status !== 200) {
    throw new Error(response.data?.error || "Gagal memuat data kunjungan");
  }

  return response.data.data;
};
