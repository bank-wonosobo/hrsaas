"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchRole } from "@/features/role/hooks/use-search-role";
import { BadgeCheck, KeyRound, ShieldCheck } from "lucide-react";
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
  const { data, isLoading, isError } = useDetailUser(id);
  const mutation = useUpdateUser(id);
  const resetMutation = useResetPassword(id);
  const { data: rolesData, isLoading: rolesLoading } = useSearchRole({
    key: "",
    page: 1,
    size: 100,
  });
  const user = data?.data;
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const userRoleIds = new Set(user?.roles?.map((role) => role.id) ?? []);

  const handleToggleRole = (roleId: string) => {
    const updated = new Set(userRoleIds);
    if (updated.has(roleId)) updated.delete(roleId);
    else updated.add(roleId);
    mutation.mutate({ role_ids: Array.from(updated) });
  };

  const handleResetSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Pengguna</DialogTitle>
            <DialogDescription>
              Kelola informasi, hak akses, dan keamanan akun pengguna.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : isError || !user ? (
            <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
              Gagal memuat detail pengguna. Tutup dialog lalu coba kembali.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 rounded-2xl border p-4">
                <Avatar className="size-14">
                  <AvatarImage src={user.image_url} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{user.name}</p>
                    {user.email_verified && (
                      <BadgeCheck
                        className="size-4 text-emerald-600"
                        aria-label="Email terverifikasi"
                      />
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {user.roles?.length ? (
                      user.roles.map((role) => (
                        <Badge key={role.id} variant="secondary">
                          {role.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Belum ada role
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold">Informasi Akun</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="user-name" className="text-sm font-medium">
                      Nama
                    </label>
                    <Input
                      key={`name-${user.id}-${user.updated_at}`}
                      id="user-name"
                      defaultValue={user.name}
                      onBlur={(event) => {
                        const value = event.currentTarget.value.trim();
                        if (value && value !== user.name) {
                          mutation.mutate({ name: value });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="user-email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      key={`email-${user.id}-${user.updated_at}`}
                      id="user-email"
                      type="email"
                      defaultValue={user.email}
                      onBlur={(event) => {
                        const value = event.currentTarget.value.trim();
                        if (value && value !== user.email) {
                          mutation.mutate({ email: value });
                        }
                      }}
                    />
                  </div>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3">
                  <Checkbox
                    checked={user.email_verified ?? false}
                    disabled={mutation.isPending}
                    onCheckedChange={(checked) =>
                      mutation.mutate({ email_verified: checked === true })
                    }
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      Email terverifikasi
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Tandai apakah alamat email pengguna sudah diverifikasi.
                    </span>
                  </span>
                </label>
              </section>

              <section className="space-y-3 border-t pt-5">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="size-4" />
                    Hak Akses
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pilih role yang diberikan kepada pengguna ini.
                  </p>
                </div>
                {rolesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-11 w-full" />
                    <Skeleton className="h-11 w-full" />
                  </div>
                ) : rolesData?.data.length ? (
                  <div className="divide-y rounded-xl border">
                    {rolesData.data.map((role) => (
                      <label
                        key={role.id}
                        className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3"
                      >
                        <span className="text-sm font-medium">{role.name}</span>
                        <Checkbox
                          checked={userRoleIds.has(role.id)}
                          disabled={mutation.isPending}
                          onCheckedChange={() => handleToggleRole(role.id)}
                          aria-label={`Atur role ${role.name}`}
                        />
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border p-4 text-sm text-muted-foreground">
                    Belum ada role yang tersedia.
                  </p>
                )}
              </section>

              <section className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <KeyRound className="size-4" />
                    Reset Password
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Atur ulang password dan minta pengguna login kembali.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResetOpen(true)}
                >
                  Reset Password
                </Button>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isResetOpen}
        onOpenChange={(open) => {
          setIsResetOpen(open);
          if (!open) setNewPassword("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password Pengguna</DialogTitle>
            <DialogDescription>
              Password baru minimal 8 karakter. Pengguna perlu login kembali
              setelah password direset.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-user-password" className="text-sm font-medium">
                Password Baru
              </label>
              <Input
                id="new-user-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetOpen(false)}
                disabled={resetMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={resetMutation.isPending}>
                {resetMutation.isPending ? "Mereset..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
