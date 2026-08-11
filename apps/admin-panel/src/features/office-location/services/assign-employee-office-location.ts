import { api } from "@/lib/axios";

export const assignEmployeeToOfficeLocation = async (
  employeeId: string,
  officeLocationId: string,
): Promise<void> => {
  const response = await api.post("/office-locations/assign-employee", {
    employee_id: employeeId,
    office_location_id: officeLocationId,
  });
  if (response.status !== 200) {
    throw new Error(
      response.data.error || "Gagal menambahkan karyawan ke lokasi kantor",
    );
  }
};
