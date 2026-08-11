import { api } from "@/lib/axios";
import { PaginatedData, ResponseData } from "@/lib/response";
import {
  ResetPasswordRequest,
  SearchUserRequest,
  UpdateUserRequest,
  User,
} from "../schemas/auth-schema";

export const getCurrentUser = async (): Promise<ResponseData<User>> => {
  const response = await api.get("/users/_current");
  return { ...response.data, data: response.data.data };
};

export const getUsers = async (
  search: SearchUserRequest,
): Promise<PaginatedData<User>> => {
  const response = await api.get("/users", {
    params: {
      key: search.key,
      page: search.page,
      size: search.size,
    },
  });

  return { ...response.data, data: response.data.data };
};

export const getUserById = async (id: string): Promise<ResponseData<User>> => {
  const response = await api.get(`/users/${id}`);
  return { ...response.data, data: response.data.data };
};

export const updateUser = async (
  id: string,
  request: UpdateUserRequest,
): Promise<ResponseData<User>> => {
  const response = await api.put(`/users/${id}`, request);

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal memperbarui pengguna");
  }

  return { ...response.data, data: response.data.data };
};

export const resetUserPassword = async (
  id: string,
  request: ResetPasswordRequest,
): Promise<void> => {
  const response = await api.patch(`/users/${id}/_reset-password`, request);

  if (response.status !== 200) {
    throw new Error(response.data.error || "Gagal mereset password");
  }
};
