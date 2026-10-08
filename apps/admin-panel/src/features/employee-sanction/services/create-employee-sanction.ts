import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import {
  CreateEmployeeSanction,
  EmployeeSanction,
  UpdateEmployeeSanction,
} from "../schemas/employee-sanction-schema";

export const createEmployeeSanction = async (
  data: CreateEmployeeSanction,
): Promise<void> => {
  await api.post("/employee-sanctions", data);
};

export const getEmployeeSanctionById = async (
  id: string,
): Promise<ResponseData<EmployeeSanction>> => {
  const response = await api.get(`/employee-sanctions/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memuat detail sanksi");
  }
  return { ...response.data, data: response.data.data };
};

export const updateEmployeeSanction = async (
  id: string,
  data: UpdateEmployeeSanction,
): Promise<void> => {
  const response = await api.put(`/employee-sanctions/${id}`, data);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memperbarui sanksi");
  }
};

export const deleteEmployeeSanction = async (id: string): Promise<void> => {
  const response = await api.delete(`/employee-sanctions/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menghapus sanksi");
  }
};
