import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { OfficeLocation } from "@/schema/office-loc-schema";

export const currentOfficeLoc = async (): Promise<
  PaginatedData<OfficeLocation>
> => {
  const response = await api.get("/office-locations/_current");

  if (response.status !== 200) {
    throw new Error(
      response.data.error || "Gagal memuat current office location",
    );
  }

  return response.data;
};
