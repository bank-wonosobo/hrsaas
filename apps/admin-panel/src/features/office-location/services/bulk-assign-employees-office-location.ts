import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import { OfficeLocation } from "../schemas/office-location-schema";

export const bulkAssignEmployeesToOfficeLocation = async (
  officeLocationId: string,
  employeeIds: string[],
): Promise<ResponseData<OfficeLocation>> => {
  const response = await api.post(
    `/office-locations/${officeLocationId}/employees`,
    { employee_ids: employeeIds },
  );
  if (response.status !== 200) {
    throw new Error(
      response.data.error || "Gagal mengassign karyawan ke lokasi kantor",
    );
  }
  return { ...response.data, data: response.data.data };
};
