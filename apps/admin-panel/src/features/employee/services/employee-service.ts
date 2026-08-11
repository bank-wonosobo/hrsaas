import { api } from "@/lib/axios";
import { PaginatedData, ResponseData } from "@/lib/response";

import { formatDate } from "@/lib/utils";
import {
  CreateEmployee,
  Employee,
  SearchEmployeeRequest,
  type UpdateEmployee,
} from "../schemas/employee-schema";

export const getEmployees = async (
  search: SearchEmployeeRequest,
): Promise<PaginatedData<Employee>> => {
  const response = await api.get("/employees", {
    params: {
      key: search.key,
      type: search.type,
      page: search.page,
      size: search.size,
    },
  });

  console.log(response);

  const employees = response.data.data; // Validate the response data against the schema
  return { ...response.data, data: employees }; // Return the validated data
};

export const createEmployee = async (
  request: CreateEmployee,
): Promise<ResponseData<Employee>> => {
  const response = await api.post("/employees", {
    ...request,
    birth_date: formatDate(new Date(request.birth_date)),
  });

  console.log(response.data.data);
  if (response.status !== 200) {
    throw new Error(response.data.error || "failed to create employee");
  }

  const employee = response.data.data; // Validate the response data against the schema

  return { ...response.data, data: employee }; // Return the validated data
};

export const importEmployeeExcel = async (
  file: File,
): Promise<ResponseData<number>> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/employees/import-excel", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal mengimport data karyawan");
  }

  return response.data;
};

export const getEmployeeById = async (
  id: string,
): Promise<ResponseData<Employee>> => {
  const response = await api.get(`/employees/${id}`);

  const employees = response.data.data;
  return { ...response.data, data: employees };
};

export const updateEmployee = async (
  id: string,
  request: UpdateEmployee,
): Promise<ResponseData<Employee>> => {
  const response = await api.put(`/employees/${id}`, {
    ...request,
    ...(request.birth_date
      ? { birth_date: formatDate(new Date(request.birth_date)) }
      : {}),
  });

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memperbarui data karyawan");
  }

  return { ...response.data, data: response.data.data };
};
