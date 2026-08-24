import { Employee } from "@/features/employee/employee-schema";
import { api } from "@/lib/axios";

export interface UpdateCurrentEmployeeDto {
  fullname?: string;
  gender?: string;
  birth_place?: string;
  birth_date?: string; // YYYY-MM-DD
  identity_number?: string;
  blood_type?: string;
  marital_status?: string;
  religion?: string;
  phone?: string;
  address?: string;
  city?: string;
  timezone?: string;
  email?: string;
}

export const updateCurrentEmployee = async (
  payload: UpdateCurrentEmployeeDto,
): Promise<Employee> => {
  const response = await api.put("/employees/_current", payload);

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memperbarui data");
  }

  return response.data.data;
};
