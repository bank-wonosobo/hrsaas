import { api } from "@/lib/axios";
import { ResponseData } from "@/lib/response";
import { Auth } from "@/schema/auth-schema";
import { CreditCollectionVisit } from "@/schema/credit-collection-schema";

export const visitCreditCollection = async (
  data: CreditCollectionVisit,
): Promise<ResponseData<Auth>> => {
  const response = await api.post("/collecting", data);

  if (response.status !== 200) {
    throw new Error(response.data.error || "Login failed");
  }

  return response.data.data;
};
