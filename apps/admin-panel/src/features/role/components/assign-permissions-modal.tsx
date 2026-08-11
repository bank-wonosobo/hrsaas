/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Button from "@/components/ui/button/button";
import Modal from "@/components/ui/modal/modal";
import { searchPermission } from "@/features/permission/services/search-permission";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAssignPermissions } from "../hooks/use-assign-permissions";
import { Role } from "../schemas/role-schema";

interface Props {
  role: Role;
}

export function AssignPermissionsModal({ role }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ["permissions-all"],
    queryFn: () => searchPermission({ key: "", page: 1, size: 100 }),
    enabled: open,
  });

  useEffect(() => {
    if (open && role.permissions) {
      setSelected(role.permissions.map((p) => p.id));
    }
  }, [open, role.permissions]);

  const mutation = useAssignPermissions();

  const togglePermission = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    mutation.mutate(
      { roleId: role.id, permissions: selected },
      {
        onSuccess: () => setOpen(false),
      },
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-blue-500 hover:text-blue-700"
      >
        <ShieldCheck size={16} />
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`Assign Permissions — ${role.name}`}
        maxWidth="sm"
      >
        <div className="mt-3 space-y-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">Memuat permissions...</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {permissionsData?.data.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-sm font-medium">{permission.name}</span>
                </label>
              ))}
              {!permissionsData?.data.length && (
                <p className="text-sm text-gray-400">Belum ada permission tersedia.</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-gray-500">
              {selected.length} permission dipilih
            </span>
            <Button
              className="px-4 py-2 bg-black text-white rounded-lg"
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
