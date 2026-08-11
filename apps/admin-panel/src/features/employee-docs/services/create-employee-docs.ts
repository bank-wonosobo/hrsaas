import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import {
  CreateEmployeeDocument,
  EmployeeDocument,
  EmployeeDocumentSchema,
} from "../schemas/employee-docs-schema";

export const createEmployeeDocument = async (
  data: CreateEmployeeDocument,
): Promise<ResponseData<EmployeeDocument>> => {
  const response = await api.post("/employee-docs", data);

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal membuat dokumen karyawan");
  }

  const result = EmployeeDocumentSchema.parse(response.data.data);

  return { ...response.data, data: result };
};
