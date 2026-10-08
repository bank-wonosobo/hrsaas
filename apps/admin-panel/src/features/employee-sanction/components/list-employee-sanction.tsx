"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { EmployeeSanctionActions } from "./employee-sanction-actions";
import toIDDate from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useSearchSanction } from "../hooks/use-search-sanction";
import { SearchEmployeeSanctionRequest } from "../schemas/employee-sanction-schema";

interface Props {
  search: SearchEmployeeSanctionRequest;
}

export default function ListEmployeeSanction({
  search,
}: Props): React.ReactNode {
  const router = useRouter();
  const { data, isLoading, isFetching, isError } = useSearchSanction(search);
  const currentPage = Number(search.page ?? 1);
  const pageSize = Number(search.size ?? 10);
  const totalPages = data?.paging?.total_page ?? 1;
  const rows = data?.data ?? [];

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => params.set(key, value));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const formatDate = (timestamp?: number | null) =>
    timestamp ? toIDDate(new Date(timestamp)) : "—";
  const firstItem = rows.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastItem = firstItem + rows.length - 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Daftar Surat Peringatan</CardTitle>
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
            Gagal memuat daftar sanksi. Silakan coba kembali.
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
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Jenis Sanksi</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Masa Berlaku</TableHead>
                    <TableHead>Dibuat Oleh</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Tidak ada data sanksi karyawan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="flex min-w-48 items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback>
                                {row.employee?.fullname
                                  ?.charAt(0)
                                  .toUpperCase() ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {row.employee?.fullname ?? "—"}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {[
                                  row.employee?.contracts?.[0]?.position?.name,
                                  row.employee?.contracts?.[0]?.division?.name,
                                ]
                                  .filter(Boolean)
                                  .join(" · ") || "—"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.sanction?.name ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[280px] whitespace-normal">
                          {row.reason || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(row.start_date)} —{" "}
                          {formatDate(row.end_date)}
                        </TableCell>
                        <TableCell>
                          {row.created_by ? (
                            <Badge variant="secondary">{row.created_by}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <EmployeeSanctionActions sanction={row} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {data && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {firstItem}–{lastItem} dari{" "}
                  {data.paging?.total_item} data
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
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
