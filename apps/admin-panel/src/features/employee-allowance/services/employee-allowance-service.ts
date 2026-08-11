import { api } from "@/lib/axios";
import { PaginatedData, ResponseData } from "@/lib/response";
import { formatDate } from "@/lib/utils";
import {
  CreateEmployeeAllowance,
  EmployeeAllowance,
  SearchEmployeeAllowanceRequest,
  UpdateEmployeeAllowance,
} from "../schemas/employee-allowance-schema";

export const getEmployeeAllowances = async (
  search: SearchEmployeeAllowanceRequest,
): Promise<PaginatedData<EmployeeAllowance>> => {
  const response = await api.get("/employee-allowances", {
    params: {
      employee_id: search.employee_id,
      active_only: search.active_only,
      page: search.page,
      size: search.size,
    },
  });
  return { ...response.data, data: response.data.data };
};

export const createEmployeeAllowance = async (
  request: CreateEmployeeAllowance,
): Promise<ResponseData<EmployeeAllowance>> => {
  const response = await api.post("/employee-allowances", {
    ...request,
    effective_date: formatDate(new Date(request.effective_date)),
    end_date: request.end_date ? formatDate(new Date(request.end_date)) : undefined,
  });
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat tunjangan");
  }
  return response.data;
};

export const updateEmployeeAllowance = async (
  id: string,
  request: UpdateEmployeeAllowance,
): Promise<ResponseData<EmployeeAllowance>> => {
  const response = await api.put(`/employee-allowances/${id}`, {
    ...request,
    effective_date: request.effective_date
      ? formatDate(new Date(request.effective_date))
      : undefined,
    end_date: request.end_date ? formatDate(new Date(request.end_date)) : undefined,
  });
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memperbarui tunjangan");
  }
  return response.data;
};

export const deleteEmployeeAllowance = async (id: string): Promise<void> => {
  const response = await api.delete(`/employee-allowances/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menghapus tunjangan");
  }
};
