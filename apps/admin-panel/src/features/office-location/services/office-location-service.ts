import { api } from "@/lib/axios";
import { PaginatedData, ResponseData } from "@/lib/response";
import {
  CreateOfficeLocation,
  OfficeLocation,
  SearchOfficeLocationRequest,
  UpdateOfficeLocation,
} from "../schemas/office-location-schema";

export const getOfficeLocations = async (
  search: SearchOfficeLocationRequest,
): Promise<PaginatedData<OfficeLocation>> => {
  const response = await api.get("/office-locations", {
    params: {
      key: search.key,
      page: search.page,
      size: search.size,
    },
  });
  return { ...response.data, data: response.data.data };
};

export const createOfficeLocation = async (
  request: CreateOfficeLocation,
): Promise<ResponseData<OfficeLocation>> => {
  const response = await api.post("/office-locations", request);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat lokasi kantor");
  }
  return { ...response.data, data: response.data.data };
};

export const getOfficeLocationById = async (
  id: string,
): Promise<ResponseData<OfficeLocation>> => {
  const response = await api.get(`/office-locations/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal mengambil data lokasi kantor");
  }
  return { ...response.data, data: response.data.data };
};

export const updateOfficeLocation = async (
  id: string,
  request: UpdateOfficeLocation,
): Promise<ResponseData<OfficeLocation>> => {
  const response = await api.put(`/office-locations/${id}`, request);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memperbarui lokasi kantor");
  }
  return { ...response.data, data: response.data.data };
};

export const deleteOfficeLocation = async (id: string): Promise<void> => {
  const response = await api.delete(`/office-locations/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menghapus lokasi kantor");
  }
};
