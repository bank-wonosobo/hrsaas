import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { CreditCollection } from "../schemas/credit-collection-schema";

export const getCreditCollectionHistory = async (
  noPjm: string,
  page: number,
  size: number,
): Promise<PaginatedData<CreditCollection>> => {
  const response = await api.get(
    `/collecting/${encodeURIComponent(noPjm)}/history`,
    { params: { page, size } },
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      response.data?.message ?? "Gagal memuat riwayat penagihan.",
    );
  }

  return response.data;
};
