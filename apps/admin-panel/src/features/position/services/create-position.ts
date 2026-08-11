import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import {
  CreatePosition,
  Position,
  PositionSchema,
} from "../schemas/position-schema";

export const createPosition = async (
  request: CreatePosition,
): Promise<ResponseData<Position>> => {
  const response = await api.post("/positions", request);

  console.log(response.data.data);
  if (response.status !== 200) {
    throw new Error(response.data.error || "failed to create employee");
  }

  const employee = PositionSchema.parse(response.data.data); // Validate the response data against the schema

  return { ...response.data, data: employee }; // Return the validated data
};
