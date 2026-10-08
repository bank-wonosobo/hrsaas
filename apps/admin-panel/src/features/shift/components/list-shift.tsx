"use client";

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
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchShift } from "../hooks/use-search-shift";
import { SearchShiftRequest } from "../schemas/shift-schema";
import { AssignEmployeesShiftModal } from "./assign-employees-shift-modal";
import { DetailShiftModal } from "./detail-shift-modal";
import { EditShiftModal } from "./edit-shift-modal";

interface Props {
  search: SearchShiftRequest;
}

export default function ListShift({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching, isError } = useSearchShift(search);
  const currentPage = Number(search.page ?? 1);
  const pageSize = Number(search.size ?? 10);
  const totalPages = data?.paging?.total_page ?? 1;

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => params.set(key, value));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const rows = data?.data ?? [];
  const firstItem = rows.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastItem = firstItem + rows.length - 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Daftar Shift</CardTitle>
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
            Gagal memuat daftar shift. Silakan coba kembali.
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
                    <TableHead>Nama Shift</TableHead>
                    <TableHead>Toleransi Terlambat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Belum ada data shift.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">
                          {shift.name}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-2 text-muted-foreground">
                            <Clock3 className="size-4" />
                            {shift.late_tolerance} menit
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <DetailShiftModal shift={shift} />
                            <EditShiftModal shift={shift} />
                            <AssignEmployeesShiftModal shift={shift} />
                          </div>
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
                {data?.paging?.total_item ?? 0} shift
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Baris per halaman
                  <Select
                    value={String(pageSize)}
                    onValueChange={(size) => updateParams({ size, page: "1" })}
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
  );
}
