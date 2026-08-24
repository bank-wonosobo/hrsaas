import { api } from "@/lib/axios";
import {
  CreditCustomer,
  SearchCreditCustomer,
} from "@/schema/credit-collection-schema";

export const searchCredit = async (
  search: SearchCreditCustomer,
): Promise<CreditCustomer[]> => {
  const response = await api.post("/collecting/_search-nasabah", {
    kodecabang: "01",
    cif: search.cif,
    nama: search.nama,
    nik: search.nik,
    nopjm: search.nopjm,
  });

  return response.data.data; // Validate the response data against the schema
};
