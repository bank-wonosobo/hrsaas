import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { Shift } from "@/schema/shift-schema";

export const currentShift = async (): Promise<PaginatedData<Shift>> => {
  const response = await api.get("/shifts/_current");

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memuat current shift");
  }

  return response.data;
};
