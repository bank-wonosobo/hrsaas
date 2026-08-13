import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import {
  CreateDivision,
  Division,
  DivisionSchema,
} from "../schemas/division-schema";

export const createDivision = async (
  request: CreateDivision,
): Promise<ResponseData<Division>> => {
  const response = await api.post("/divisions", request);

  console.log(response.data.data);
  if (response.status !== 200) {
    throw new Error(response.data.error || "failed to create employee");
  }

  const employee = DivisionSchema.parse(response.data.data); // Validate the response data against the schema

  return { ...response.data, data: employee }; // Return the validated data
};
