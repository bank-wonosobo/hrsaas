"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetUsers } from "../hooks/use-get-users";
import { SearchUserRequest, User } from "../schemas/auth-schema";
import DetailUserModal from "./detail/detail-user-modal";

interface Props {
  search: SearchUserRequest;
}

export default function ListUser({ search }: Props): React.ReactNode {
  const router = useRouter();
  const { data, isLoading, isFetching, isError } = useGetUsers(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentPage = Number(search.page ?? 1);
  const pageSize = Number(search.size ?? 10);
  const totalPages = data?.paging?.total_page ?? 1;
  const users = data?.data ?? [];

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => params.set(key, value));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const firstItem = users.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastItem = firstItem + users.length - 1;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-6">
              <div className="h-10 animate-pulse rounded-md bg-muted" />
              <div className="h-12 animate-pulse rounded-md bg-muted" />
              <div className="h-12 animate-pulse rounded-md bg-muted" />
            </div>
          ) : isError ? (
            <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
              Gagal memuat daftar pengguna. Silakan coba kembali.
            </p>
          ) : (
            <>
              <div className="relative">
                {isFetching && (
                  <div className="absolute inset-0 z-10 bg-background/40" />
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pengguna</TableHead>
                      <TableHead>Hak Akses</TableHead>
                      <TableHead>Status Email</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Tidak ada data pengguna.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex min-w-0 items-center gap-3">
                              <Avatar className="size-10">
                                <AvatarImage
                                  src={user.image_url}
                                  alt={user.name}
                                />
                                <AvatarFallback>
                                  {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {user.name}
                                </p>
                                <p className="truncate text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.roles?.length ? (
                              <div className="flex flex-wrap gap-1.5">
                                {user.roles.map((role) => (
                                  <Badge
                                    key={role.id}
                                    variant="secondary"
                                    className="gap-1"
                                  >
                                    <ShieldCheck />
                                    {role.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Belum ada role
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.email_verified ? "default" : "outline"
                              }
                            >
                              {user.email_verified
                                ? "Terverifikasi"
                                : "Belum terverifikasi"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedId(user.id)}
                            >
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {firstItem}–{lastItem} dari{" "}
                  {data?.paging?.total_item ?? 0} pengguna
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    Baris per halaman
                    <Select
                      value={String(pageSize)}
                      onValueChange={(size) =>
                        updateParams({ size, page: "1" })
                      }
                    >
                      <SelectTrigger className="h-9 w-[76px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 20, 50, 100].map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mr-2 text-sm text-muted-foreground">
                      Halaman {currentPage} dari {Math.max(totalPages, 1)}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Halaman sebelumnya"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        updateParams({ page: String(currentPage - 1) })
                      }
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Halaman berikutnya"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        updateParams({ page: String(currentPage + 1) })
                      }
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedId && (
        <DetailUserModal
          id={selectedId}
          isOpen={!!selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
