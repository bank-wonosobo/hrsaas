import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import { Auth } from "../schemas/auth-schema";

export const logout = async (): Promise<void> => {
  await api.delete("/users/_logout");
};

export const login = async (
  email: string,
  password: string,
): Promise<ResponseData<Auth>> => {
  // Simulate an API call to authenticate the user
  const response = await api.post("/_login", { email, password });

  if (response.status !== 200) {
    throw new Error(response.data.error || "Login failed");
  }

  const authData = response.data.data; // Validate the response data against the schema

  return { ...response.data, data: authData }; // Return the validated data
};
