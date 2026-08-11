/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { searchPermission } from "@/features/permission/services/search-permission";
import { FormRole } from "@/features/role/components/form-role";
import { assignPermissions } from "@/features/role/services/assign-permissions";
import { searchRole } from "@/features/role/services/search-role";
import { getCurrentUser } from "@/features/user/services/user-service";
import { getAuthUser, saveAuthUser } from "@/lib/auth-storage";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FormPermission } from "./form-permission";

export default function PivotTable() {
  const [filterKey, setFilterKey] = useState("");
  const [assignments, setAssignments] = useState<Record<string, Set<string>>>(
    {},
  );
  const [saving, setSaving] = useState<Set<string>>(new Set());

  const { data: permissionsData, isLoading: loadingPermissions } = useQuery({
    queryKey: ["permissions", "", 1, 100],
    queryFn: () => searchPermission({ key: "", page: 1, size: 100 }),
  });

  const { data: rolesData, isLoading: loadingRoles } = useQuery({
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

  const handleToggle = async (roleId: string, permissionId: string) => {
    const current = new Set(assignments[roleId] ?? []);
    const updated = new Set(current);
    updated.has(permissionId)
      ? updated.delete(permissionId)
      : updated.add(permissionId);

    setAssignments((prev) => ({ ...prev, [roleId]: updated }));
    setSaving((prev) => new Set([...prev, roleId]));

    try {
      await assignPermissions(roleId, Array.from(updated));

      const authUser = getAuthUser();
      const userHasRole = authUser?.roles?.some((r) => r.id === roleId);
      if (authUser && userHasRole) {
        const { data: freshUser } = await getCurrentUser();
        saveAuthUser(freshUser);
      }
    } catch {
      setAssignments((prev) => ({ ...prev, [roleId]: current }));
      toast.error("Gagal mengubah permission");
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(roleId);
        return next;
      });
    }
  };

  const permissions = useMemo(
    () => permissionsData?.data ?? [],
    [permissionsData?.data],
  );
  const roles = rolesData?.data ?? [];

  const filteredPermissions = useMemo(
    () =>
      filterKey
        ? permissions.filter((p) =>
            p.name.toLowerCase().includes(filterKey.toLowerCase()),
          )
        : permissions,
    [permissions, filterKey],
  );

  if (loadingPermissions || loadingRoles) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white border rounded-2xl p-4">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">
            {permissions.length}
          </span>{" "}
          permissions ·{" "}
          <span className="font-semibold text-gray-700">{roles.length}</span>{" "}
          roles
        </p>
        <div className="flex gap-3">
          <FormPermission />
          <FormRole />
        </div>
      </div>

      {/* Pivot table */}
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 sticky left-0 bg-gray-50 z-10 min-w-[240px] text-left">
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={filterKey}
                    onChange={(e) => setFilterKey(e.target.value)}
                    placeholder="Filter permission..."
                    className="w-full pl-7 pr-3 py-1.5 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-gray-300 bg-white"
                  />
                </div>
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  className="px-4 py-3 text-center min-w-[130px]"
                >
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {role.name}
                  </p>
                  <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                    {assignments[role.id]?.size ?? 0} aktif
                  </p>
                </th>
              ))}
              {roles.length === 0 && (
                <th className="px-4 py-3 text-xs font-normal text-gray-400">
                  Belum ada role
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredPermissions.map((permission, i) => (
              <tr
                key={permission.id}
                className={`border-b last:border-0 transition-colors hover:bg-blue-50/40 ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <td
                  className="px-4 py-3 text-xs font-medium text-gray-700 sticky left-0 z-10"
                  style={{
                    backgroundColor:
                      i % 2 === 0 ? "white" : "rgba(249,250,251,0.8)",
                  }}
                >
                  {permission.name}
                </td>
                {roles.map((role) => {
                  const checked =
                    assignments[role.id]?.has(permission.id) ?? false;
                  const isSaving = saving.has(role.id);
                  return (
                    <td key={role.id} className="px-4 py-3 text-center">
                      {isSaving ? (
                        <Loader2
                          size={14}
                          className="animate-spin mx-auto text-gray-300"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggle(role.id, permission.id)}
                          className="w-4 h-4 accent-black cursor-pointer"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {filteredPermissions.length === 0 && (
              <tr>
                <td
                  colSpan={roles.length + 1}
                  className="text-center py-12 text-xs text-gray-400"
                >
                  {filterKey
                    ? `Tidak ada permission cocok dengan "${filterKey}"`
                    : "Belum ada permission."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
