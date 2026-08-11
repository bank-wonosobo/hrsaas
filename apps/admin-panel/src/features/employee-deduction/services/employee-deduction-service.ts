import { api } from "@/lib/axios";
import { PaginatedData, ResponseData } from "@/lib/response";
import { formatDate } from "@/lib/utils";
import {
  CreateEmployeeDeduction,
  EmployeeDeduction,
  SearchEmployeeDeductionRequest,
  UpdateEmployeeDeduction,
} from "../schemas/employee-deduction-schema";

export const getEmployeeDeductions = async (
  search: SearchEmployeeDeductionRequest,
): Promise<PaginatedData<EmployeeDeduction>> => {
  const response = await api.get("/employee-deductions", {
    params: {
      employee_id: search.employee_id,
      active_only: search.active_only,
      page: search.page,
      size: search.size,
    },
  });
  return { ...response.data, data: response.data.data };
};

export const createEmployeeDeduction = async (
  request: CreateEmployeeDeduction,
): Promise<ResponseData<EmployeeDeduction>> => {
  const response = await api.post("/employee-deductions", {
    ...request,
    effective_date: formatDate(new Date(request.effective_date)),
    end_date: request.end_date ? formatDate(new Date(request.end_date)) : undefined,
  });
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat potongan");
  }
  return response.data;
};

export const updateEmployeeDeduction = async (
  id: string,
  request: UpdateEmployeeDeduction,
): Promise<ResponseData<EmployeeDeduction>> => {
  const response = await api.put(`/employee-deductions/${id}`, {
    ...request,
    effective_date: request.effective_date
      ? formatDate(new Date(request.effective_date))
      : undefined,
    end_date: request.end_date ? formatDate(new Date(request.end_date)) : undefined,
  });
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memperbarui potongan");
  }
  return response.data;
};

export const deleteEmployeeDeduction = async (id: string): Promise<void> => {
  const response = await api.delete(`/employee-deductions/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menghapus potongan");
  }
};
