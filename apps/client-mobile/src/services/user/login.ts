import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import { Auth } from "@/schema/auth-schema";

export const signInUser = async (
  email: string,
  password: string,
): Promise<ResponseData<Auth>> => {
  const response = await api.post("/_login", { email, password });

  if (response.status !== 200) {
    throw new Error(response.data.error || "Login failed");
  }

  const authData = response.data.data;

  return { ...response.data, data: authData };
};
