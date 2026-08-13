import { api } from "@/lib/axios";
import { PaginatedData, ResponseData } from "@/lib/response";
import { CreateShift, SearchShiftRequest, Shift } from "../schemas/shift-schema";

export const getShifts = async (
  search: SearchShiftRequest,
): Promise<PaginatedData<Shift>> => {
  const response = await api.get("/shifts", {
    params: { key: search.key, page: search.page, size: search.size },
  });
  return { ...response.data, data: response.data.data };
};

export const getShiftById = async (id: string): Promise<ResponseData<Shift>> => {
  const response = await api.get(`/shifts/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal mengambil data shift");
  }
  return { ...response.data, data: response.data.data };
};

export const createShift = async (request: CreateShift): Promise<ResponseData<Shift>> => {
  const response = await api.post("/shifts", request);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat shift");
  }
  return { ...response.data, data: response.data.data };
};

export const bulkAssignEmployeesToShift = async (
  shiftId: string,
  employeeIds: string[],
): Promise<ResponseData<Shift>> => {
  const response = await api.post(`/shifts/${shiftId}/employees`, {
    employee_ids: employeeIds,
  });
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal mengassign karyawan ke shift");
  }
  return { ...response.data, data: response.data.data };
};
