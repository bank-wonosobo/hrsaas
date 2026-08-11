import { User } from "@/features/user/schemas/auth-schema";

const AUTH_USER_KEY = "auth_user";

export const saveAuthUser = (user: User): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const getAuthUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const clearAuthUser = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_USER_KEY);
};
