import { api } from "@/lib/axios";
import { PaginatedData, ResponseData } from "@/lib/response";
import {
  CreatePayroll,
  CreatePayrollAdjustment,
  Payroll,
  PayrollAdjustment,
  PayrollApproval,
  PayrollPayment,
  RejectPayroll,
  SearchPayrollPaymentRequest,
  SearchPayrollRequest,
  UpdatePayrollPaymentStatus,
} from "../schemas/payroll-schema";

export const getPayrolls = async (
  search: SearchPayrollRequest,
): Promise<PaginatedData<Payroll>> => {
  const response = await api.get("/payrolls", {
    params: {
      status: search.status,
      period_year: search.period_year,
      page: search.page,
      size: search.size,
    },
  });
  return { ...response.data, data: response.data.data };
};

export const createPayroll = async (
  request: CreatePayroll,
): Promise<ResponseData<Payroll>> => {
  const response = await api.post("/payrolls", request);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat payroll");
  }
  return response.data;
};

export const getPayrollById = async (id: string): Promise<ResponseData<Payroll>> => {
  const response = await api.get(`/payrolls/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal mengambil data payroll");
  }
  return response.data;
};

export const deletePayroll = async (id: string): Promise<void> => {
  const response = await api.delete(`/payrolls/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menghapus payroll");
  }
};

export const calculatePayroll = async (
  id: string,
): Promise<ResponseData<Payroll>> => {
  const response = await api.post(`/payrolls/${id}/calculate`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menghitung payroll");
  }
  return response.data;
};

export const submitPayroll = async (id: string): Promise<ResponseData<Payroll>> => {
  const response = await api.post(`/payrolls/${id}/submit`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal mengajukan payroll");
  }
  return response.data;
};

export const cancelPayroll = async (id: string): Promise<ResponseData<Payroll>> => {
  const response = await api.post(`/payrolls/${id}/cancel`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membatalkan payroll");
  }
  return response.data;
};

export const approvePayroll = async (id: string): Promise<ResponseData<Payroll>> => {
  const response = await api.post(`/payrolls/${id}/approve`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menyetujui payroll");
  }
  return response.data;
};

export const rejectPayroll = async (
  id: string,
  request: RejectPayroll,
): Promise<ResponseData<Payroll>> => {
  const response = await api.post(`/payrolls/${id}/reject`, request);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menolak payroll");
  }
  return response.data;
};

export const payPayroll = async (id: string): Promise<ResponseData<Payroll>> => {
  const response = await api.post(`/payrolls/${id}/pay`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memproses pembayaran payroll");
  }
  return response.data;
};

export const getPayrollApprovals = async (
  id: string,
): Promise<ResponseData<PayrollApproval[]>> => {
  const response = await api.get(`/payrolls/${id}/approvals`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal mengambil riwayat approval");
  }
  return response.data;
};

export const createPayrollAdjustment = async (
  payrollDetailId: string,
  request: CreatePayrollAdjustment,
): Promise<ResponseData<PayrollAdjustment>> => {
  const response = await api.post(
    `/payroll-details/${payrollDetailId}/adjustments`,
    request,
  );
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menambahkan penyesuaian");
  }
  return response.data;
};

export const deletePayrollAdjustment = async (id: string): Promise<void> => {
  const response = await api.delete(`/payroll-adjustments/${id}`);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal menghapus penyesuaian");
  }
};

export const getPayrollPayments = async (
  search: SearchPayrollPaymentRequest,
): Promise<PaginatedData<PayrollPayment>> => {
  const response = await api.get("/payroll-payments", {
    params: {
      payroll_id: search.payroll_id,
      status: search.status,
      page: search.page,
      size: search.size,
    },
  });
  return { ...response.data, data: response.data.data };
};

export const updatePayrollPaymentStatus = async (
  id: string,
  request: UpdatePayrollPaymentStatus,
): Promise<ResponseData<PayrollPayment>> => {
  const response = await api.patch(`/payroll-payments/${id}/status`, request);
  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memperbarui status pembayaran");
  }
  return response.data;
};
