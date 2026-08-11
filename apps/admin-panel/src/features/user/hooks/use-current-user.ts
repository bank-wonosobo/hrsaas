"use client";
import { getAuthUser } from "@/lib/auth-storage";
import { useEffect, useState } from "react";
import { User } from "../schemas/auth-schema";

export const useCurrentUser = (): User | null => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  return user;
};

export const useHasPermission = (permission: string): boolean => {
  const user = useCurrentUser();
  if (!user?.permissions || user.permissions.length === 0) return false;
  return user.permissions.some((p) => p.name === permission);
};
