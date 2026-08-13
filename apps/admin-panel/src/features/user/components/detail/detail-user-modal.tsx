"use client";
import EditableField from "@/components/shared/editable-field/editable-field";
import Button from "@/components/ui/button/button";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Switch from "@/components/ui/switch/switch";
import { useSearchRole } from "@/features/role/hooks/use-search-role";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useDetailUser } from "../../hooks/use-detail-user";
import { useResetPassword } from "../../hooks/use-reset-password";
import { useUpdateUser } from "../../hooks/use-update-user";

interface Props {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetailUserModal({
  id,
  isOpen,
  onClose,
}: Props): React.ReactNode {
  const { data } = useDetailUser(id);
  const mutation = useUpdateUser(id);
  const resetMutation = useResetPassword(id);
  const { data: rolesData } = useSearchRole({ key: "", page: 1, size: 100 });
  const user = data?.data;

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const userRoleIds = new Set(user?.roles?.map((r) => r.id) ?? []);

  const handleToggleRole = (roleId: string) => {
    const updated = new Set(userRoleIds);
    updated.has(roleId) ? updated.delete(roleId) : updated.add(roleId);
    mutation.mutate({ role_ids: Array.from(updated) });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMutation.mutate(
      { new_password: newPassword },
      {
        onSuccess: () => {
          setIsResetOpen(false);
          setNewPassword("");
        },
      },
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Detail Pengguna" maxWidth="md">
        {/* Avatar & Roles */}
        <div className="flex items-center gap-4 pb-5 mb-2 border-b">
          <div className="h-14 w-14 rounded-full bg-gray-200 flex justify-center items-center text-2xl font-semibold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{user?.name}</p>
              {user?.email_verified && (
                <BadgeCheck size={16} className="text-green-600" />
              )}
            </div>
            {user?.roles && user.roles.length > 0 && (
              <div className="flex gap-2 mt-1">
                {user.roles.map((role) => (
                  <div key={role.id} className="flex items-center gap-1 text-xs text-gray-500">
                    <ShieldCheck size={12} />
                    <span>{role.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-0 mt-4">
          <EditableField
            label="Nama"
            value={user?.name}
            hint="Pastikan nama sesuai"
            onSave={(val) => mutation.mutate({ name: val })}
          />
          <EditableField
            label="Email"
            value={user?.email}
            hint="Pastikan email sesuai"
            onSave={(val) => mutation.mutate({ email: val })}
          />
          <div className="flex flex-col w-full justify-start items-center pb-6 border-b border-gray-200">
            <div className="flex w-full justify-between gap-y-1 items-center">
              <label className="text-md font-semibold">Email Terverifikasi</label>
              <Switch
                checked={user?.email_verified ?? false}
                onChange={(val) => mutation.mutate({ email_verified: val })}
              />
            </div>
            <div className="flex w-full justify-start mt-1">
              <p className="text-sm text-gray-500">
                {user?.email_verified ? "Terverifikasi" : "Belum diverifikasi"}
              </p>
            </div>
          </div>
        </div>

        {/* Roles */}
        {rolesData?.data && rolesData.data.length > 0 && (
          <div className="pb-6 border-b border-gray-200 mt-2">
            <div className="flex items-center gap-1.5 mb-3">
              <ShieldCheck size={15} className="text-gray-500" />
              <p className="text-md font-semibold">Roles</p>
            </div>
            <div className="space-y-3">
              {rolesData.data.map((role) => (
                <div key={role.id} className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">{role.name}</p>
                  <Switch
                    checked={userRoleIds.has(role.id)}
                    onChange={() => handleToggleRole(role.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Password */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-md font-semibold">Reset Password</p>
              <p className="text-sm text-gray-500">
                Atur ulang password pengguna ini
              </p>
            </div>
            <Button variant="outline" onClick={() => setIsResetOpen(true)}>
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Reset Password Pengguna"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsResetOpen(false)}>
              Batal
            </Button>
            <Button
              form="reset-password-form"
              type="submit"
              loading={resetMutation.isPending}
            >
              Reset
            </Button>
          </>
        }
      >
        <form
          id="reset-password-form"
          onSubmit={handleResetSubmit}
          className="space-y-4"
        >
          <p className="text-sm text-gray-500">
            Password baru minimal 8 karakter. Pengguna perlu login ulang setelah
            password direset.
          </p>
          <Input
            label="Password Baru"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </form>
      </Modal>
    </>
  );
}
