import { api } from "@/lib/axios";
import { CreateEmployeeSanction } from "../schemas/employee-sanction-schema";

export const createEmployeeSanction = async (
  data: CreateEmployeeSanction,
): Promise<void> => {
  await api.post("/employee-sanctions", data);
};
