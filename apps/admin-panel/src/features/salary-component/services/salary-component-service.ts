import { api } from "@/lib/axios";
import { PaginatedData, ResponseData } from "@/lib/response";
import {
  CreateSalaryComponent,
  SalaryComponent,
  SearchSalaryComponentRequest,
  UpdateSalaryComponent,
} from "../schemas/salary-component-schema";

export const getSalaryComponents = async (
  search: SearchSalaryComponentRequest,
): Promise<PaginatedData<SalaryComponent>> => {
  const response = await api.get("/salary-components", {
    params: {
      key: search.key,
      type: search.type,
      active_only: search.active_only,
      page: search.page,
      size: search.size,
    },
  });
  return { ...response.data, data: response.data.data };
};

export const createSalaryComponent = async (
  request: CreateSalaryComponent,
): Promise<ResponseData<SalaryComponent>> => {
  const response = await api.post("/salary-components", request);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat komponen gaji");
  }
  return response.data;
};

export const updateSalaryComponent = async (
  id: string,
  request: UpdateSalaryComponent,
): Promise<ResponseData<SalaryComponent>> => {
  const response = await api.put(`/salary-components/${id}`, request);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memperbarui komponen gaji");
  }
  return response.data;
};

export const deleteSalaryComponent = async (id: string): Promise<void> => {
  const response = await api.delete(`/salary-components/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menghapus komponen gaji");
  }
};
