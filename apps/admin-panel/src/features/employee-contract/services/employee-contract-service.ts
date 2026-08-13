import { api } from "@/lib/axios";
import { PaginatedData, ResponseData } from "@/lib/response";
import { formatDate } from "@/lib/utils";
import {
  CreateEmployeeContract,
  EmployeeContract,
  SearchEmployeeContractRequest,
  UpdateEmployeeContract,
} from "../schemas/employee-contract-schema";

export const getEmployeeContracts = async (
  search: SearchEmployeeContractRequest,
): Promise<PaginatedData<EmployeeContract>> => {
  const response = await api.get("/employee-contracts", {
    params: {
      employee_id: search.employee_id,
      division_id: search.division_id,
      position_id: search.position_id,
      active_only: search.active_only,
      page: search.page,
      size: search.size,
    },
  });

  return { ...response.data, data: response.data.data };
};

export const createEmployeeContract = async (
  request: CreateEmployeeContract,
): Promise<ResponseData<EmployeeContract>> => {
  const response = await api.post("/employee-contracts", {
    ...request,
    start_date: request.start_date
      ? formatDate(new Date(request.start_date))
      : undefined,
    end_date: request.end_date
      ? formatDate(new Date(request.end_date))
      : undefined,
  });

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat kontrak karyawan");
  }

  return response.data;
};

export const updateEmployeeContract = async (
  id: string,
  request: UpdateEmployeeContract,
): Promise<ResponseData<EmployeeContract>> => {
  const response = await api.put(`/employee-contracts/${id}`, {
    ...request,
    start_date: request.start_date
      ? formatDate(new Date(request.start_date))
      : undefined,
    end_date: request.end_date
      ? formatDate(new Date(request.end_date))
      : undefined,
  });

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal mengubah kontrak karyawan");
  }

  return response.data;
};
