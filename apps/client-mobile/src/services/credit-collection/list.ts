import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { CreditCollectionVisitRecord } from "@/schema/credit-collection-schema";

export type ListCreditCollectionParams = {
  nama?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  size?: number;
};

export const listCreditCollection = async (
  params: ListCreditCollectionParams,
): Promise<PaginatedData<CreditCollectionVisitRecord>> => {
  const response = await api.get("/collecting", { params });

  return {
    data: response.data.data,
    paging: response.data.paging,
  };
};
