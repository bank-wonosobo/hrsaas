"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { searchPermission } from "@/features/permission/services/search-permission";
import { FormRole } from "@/features/role/components/form-role";
import { assignPermissions } from "@/features/role/services/assign-permissions";
import { searchRole } from "@/features/role/services/search-role";
import { getCurrentUser } from "@/features/user/services/user-service";
import { getAuthUser, saveAuthUser } from "@/lib/auth-storage";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FormPermission } from "./form-permission";

export default function PivotTable() {
  const [filterKey, setFilterKey] = useState("");
  const [assignments, setAssignments] = useState<Record<string, Set<string>>>(
    {},
  );
  const [saving, setSaving] = useState<Set<string>>(new Set());

  const {
    data: permissionsData,
    isLoading: loadingPermissions,
    isError: permissionsError,
  } = useQuery({
    queryKey: ["permissions", "", 1, 100],
    queryFn: () => searchPermission({ key: "", page: 1, size: 100 }),
  });

  const {
    data: rolesData,
    isLoading: loadingRoles,
    isError: rolesError,
  } = useQuery({
    queryKey: ["roles", "", 1, 100],
    queryFn: () => searchRole({ key: "", page: 1, size: 100 }),
  });

  useEffect(() => {
    if (rolesData?.data) {
      setAssignments((prev) => {
        const next = { ...prev };
        rolesData.data.forEach((role) => {
          if (!next[role.id]) {
            next[role.id] = new Set(role.permissions?.map((p) => p.id) ?? []);
          }
        });
        return next;
      });
    }
  }, [rolesData?.data]);

  const permissions = useMemo(
    () => permissionsData?.data ?? [],
    [permissionsData?.data],
  );
  const roles = rolesData?.data ?? [];
  const filteredPermissions = useMemo(() => {
    const query = filterKey.trim().toLowerCase();
    return query
      ? permissions.filter((permission) =>
          permission.name.toLowerCase().includes(query),
        )
      : permissions;
  }, [permissions, filterKey]);

  const handleToggle = async (roleId: string, permissionId: string) => {
    if (saving.has(roleId)) return;

    const current = new Set(assignments[roleId] ?? []);
    const updated = new Set(current);
    if (updated.has(permissionId)) updated.delete(permissionId);
    else updated.add(permissionId);

    setAssignments((previous) => ({ ...previous, [roleId]: updated }));
    setSaving((previous) => new Set([...previous, roleId]));

    try {
      await assignPermissions(roleId, Array.from(updated));

      const authUser = getAuthUser();
      const userHasRole = authUser?.roles?.some((role) => role.id === roleId);
      if (authUser && userHasRole) {
        const { data: freshUser } = await getCurrentUser();
        saveAuthUser(freshUser);
      }
    } catch {
      setAssignments((previous) => ({ ...previous, [roleId]: current }));
      toast.error("Gagal mengubah permission");
    } finally {
      setSaving((previous) => {
        const next = new Set(previous);
        next.delete(roleId);
        return next;
      });
    }
  };

  if (loadingPermissions || loadingRoles) {
    return (
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (permissionsError || rolesError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
            Gagal memuat daftar role atau permission. Silakan muat ulang halaman.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-muted">
              <ShieldCheck className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Pengaturan Hak Akses</p>
              <p className="text-sm text-muted-foreground">
                {permissions.length} permission · {roles.length} role
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <FormPermission />
            <FormRole />
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base">Matriks Role & Permission</CardTitle>
          <CardDescription>
            Atur permission setiap role. Perubahan disimpan langsung.
          </CardDescription>
          <div className="relative mt-2 max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filterKey}
              onChange={(event) => setFilterKey(event.target.value)}
              placeholder="Filter permission..."
              aria-label="Filter permission"
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-[70vh] overflow-auto">
            <Table className="min-w-max border-separate border-spacing-0">
              <TableHeader className="sticky top-0 z-20 bg-background">
                <TableRow>
                  <TableHead className="sticky left-0 z-30 min-w-[260px] border-b bg-background">
                    Permission
                  </TableHead>
                  {roles.map((role) => (
                    <TableHead
                      key={role.id}
                      className="min-w-[150px] border-b text-center"
                    >
                      <span className="block font-semibold">{role.name}</span>
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                        {assignments[role.id]?.size ?? 0} aktif
                      </span>
                    </TableHead>
                  ))}
                  {roles.length === 0 && (
                    <TableHead className="min-w-[150px] border-b text-center font-normal text-muted-foreground">
                      Belum ada role
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="sticky left-0 z-10 border-b bg-background font-medium">
                      {permission.name}
                    </TableCell>
                    {roles.map((role) => {
                      const checked =
                        assignments[role.id]?.has(permission.id) ?? false;
                      const isSaving = saving.has(role.id);
                      return (
                        <TableCell
                          key={role.id}
                          className="border-b text-center"
                        >
                          {isSaving ? (
                            <Loader2
                              className="mx-auto size-4 animate-spin text-muted-foreground"
                              aria-label={`Menyimpan permission role ${role.name}`}
                            />
                          ) : (
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() =>
                                void handleToggle(role.id, permission.id)
                              }
                              aria-label={`${checked ? "Cabut" : "Berikan"} ${permission.name} untuk role ${role.name}`}
                            />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {filteredPermissions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={Math.max(roles.length + 1, 2)}
                      className="h-28 text-center text-muted-foreground"
                    >
                      {filterKey
                        ? `Tidak ada permission yang cocok dengan "${filterKey}".`
                        : "Belum ada permission."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
