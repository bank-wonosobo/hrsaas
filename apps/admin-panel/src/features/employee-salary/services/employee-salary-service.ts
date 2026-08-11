import { api } from "@/lib/axios";
import { PaginatedData, ResponseData } from "@/lib/response";
import { formatDate } from "@/lib/utils";
import {
  CreateEmployeeSalary,
  EmployeeSalary,
  SearchEmployeeSalaryRequest,
  UpdateEmployeeSalary,
} from "../schemas/employee-salary-schema";

export const getEmployeeSalaries = async (
  search: SearchEmployeeSalaryRequest,
): Promise<PaginatedData<EmployeeSalary>> => {
  const response = await api.get("/employee-salaries", {
    params: {
      employee_id: search.employee_id,
      active_only: search.active_only,
      page: search.page,
      size: search.size,
    },
  });
  return { ...response.data, data: response.data.data };
};

export const createEmployeeSalary = async (
  request: CreateEmployeeSalary,
): Promise<ResponseData<EmployeeSalary>> => {
  const response = await api.post("/employee-salaries", {
    ...request,
    effective_date: formatDate(new Date(request.effective_date)),
    end_date: request.end_date ? formatDate(new Date(request.end_date)) : undefined,
  });
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat data gaji pokok");
  }
  return response.data;
};

export const updateEmployeeSalary = async (
  id: string,
  request: UpdateEmployeeSalary,
): Promise<ResponseData<EmployeeSalary>> => {
  const response = await api.put(`/employee-salaries/${id}`, {
    ...request,
    effective_date: request.effective_date
      ? formatDate(new Date(request.effective_date))
      : undefined,
    end_date: request.end_date ? formatDate(new Date(request.end_date)) : undefined,
  });
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memperbarui data gaji pokok");
  }
  return response.data;
};

export const deleteEmployeeSalary = async (id: string): Promise<void> => {
  const response = await api.delete(`/employee-salaries/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menghapus data gaji pokok");
  }
};
