import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import {
  CreditCollection,
  SearchCreditCollectionRequest,
} from "../schemas/credit-collection-schema";

export const searchCreditCollection = async (
  search: SearchCreditCollectionRequest,
): Promise<PaginatedData<CreditCollection>> => {
  const response = await api.get("/collecting/admin", {
    params: {
      employee_id: search.employee_id,
      nasabah_name: search.nasabah_name,
      no_pjm: search.no_pjm,
      start_date: search.start_date,
      end_date: search.end_date,
      page: search.page,
      size: search.size,
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      response.data?.message ?? "Gagal memuat data penagihan kredit.",
    );
  }

  return response.data;
};
