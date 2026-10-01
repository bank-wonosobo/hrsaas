"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toIDDate from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Printer,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSearchTimeOffReq } from "../hooks/use-search-timeoffreq";
import {
  SearchTimeOffRequest,
  TimeOffRequest,
} from "../schemas/time-off-schema";
import { printTimeOffLetter } from "./print-time-off";

interface Props {
  search: SearchTimeOffRequest;
}

function TimeOffDetailModal({
  request,
  isOpen,
  onClose,
}: {
  request: TimeOffRequest | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!request) return null;

  const contract = request.employee.contracts?.[0];
  const statusVariant =
    request.request_status === "REJECTED"
      ? "destructive"
      : request.request_status === "APPROVED"
        ? "secondary"
        : "outline";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail pengajuan cuti</DialogTitle>
          <DialogDescription>
            Informasi pengajuan, lampiran, dan riwayat persetujuan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
              {request.employee.fullname.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {request.employee.fullname}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {contract
                  ? `${contract.position.name} · ${contract.division.name}`
                  : "–"}
              </p>
              <p className="text-xs text-muted-foreground">
                {request.employee.employee_number}
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
              Informasi Pengajuan
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Jenis Cuti</p>
                <p className="text-sm font-medium">
                  {request.time_off_type.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {request.time_off_type.category}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Status</p>
                <Badge
                  variant={statusVariant}
                  className={
                    request.request_status === "APPROVED"
                      ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950"
                      : request.request_status === "PENDING"
                        ? "border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950"
                        : undefined
                  }
                >
                  {request.request_status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Tanggal Pengajuan
                </p>
                <p className="text-sm font-medium">
                  {toIDDate(new Date(request.created_at))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Hari</p>
                <p className="text-sm font-medium">
                  {request.requested_days} hari
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tanggal Mulai</p>
                <p className="text-sm font-medium">
                  {toIDDate(new Date(request.start_date))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tanggal Akhir</p>
                <p className="text-sm font-medium">
                  {toIDDate(new Date(request.end_date))}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Alasan
            </h3>
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm leading-relaxed">
              {request.request_reason || (
                <span className="italic text-muted-foreground">
                  Tidak ada alasan
                </span>
              )}
            </p>
          </section>

          {request.file_url && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Lampiran
              </h3>
              <a
                href={request.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="size-4" />
                Lihat File
              </a>
            </section>
          )}

          {request.approvals.length > 0 && (
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
                Approval
              </h3>
              <div className="flex flex-col gap-2">
                {request.approvals.map((approval, index) => (
                  <div
                    key={`${approval.employee_name}-${index}`}
                    className="flex items-start justify-between gap-3 border-b py-2.5 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {approval.employee_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {approval.employee_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {approval.action_at
                            ? toIDDate(new Date(approval.action_at))
                            : "Belum ada aksi"}
                        </p>
                        {approval.action_reason && (
                          <p className="mt-0.5 text-xs italic text-muted-foreground">
                            &ldquo;{approval.action_reason}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        approval.status === "REJECTED"
                          ? "destructive"
                          : approval.status === "APPROVED"
                            ? "secondary"
                            : "outline"
                      }
                      className={
                        approval.status === "APPROVED"
                          ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950"
                          : approval.status === "PENDING"
                            ? "border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950"
                            : undefined
                      }
                    >
                      {approval.status === "APPROVED" ? (
                        <Check />
                      ) : approval.status === "REJECTED" ? (
                        <X />
                      ) : null}
                      {approval.status === "PENDING"
                        ? "Menunggu"
                        : approval.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ListTimeOffRequest({ search }: Props): React.ReactNode {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { data, isLoading, isFetching } = useSearchTimeOffReq(search);

  const handlePaginate = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSize = (size: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("size", size);
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const currentPage = Math.max(1, Number(search.page) || 1);
  const totalPages = Math.max(1, data?.paging.total_page ?? 1);

  if (isLoading || isFetching) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Karyawan</TableHead>
                <TableHead>Tgl Pengajuan</TableHead>
                <TableHead>Jenis Cuti</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length ? (
                data.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex min-w-52 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground">
                          {row.employee.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {row.employee.fullname}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {row.employee.contracts?.[0]?.position.name} ·{" "}
                            {row.employee.contracts?.[0]?.division.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {toIDDate(new Date(row.created_at))}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{row.time_off_type.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.time_off_type.category}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p>
                        {toIDDate(new Date(row.start_date))} s/d{" "}
                        {toIDDate(new Date(row.end_date))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.requested_days} hari
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.request_status === "REJECTED"
                            ? "destructive"
                            : row.request_status === "APPROVED"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          row.request_status === "APPROVED"
                            ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950"
                            : row.request_status === "PENDING"
                              ? "border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950"
                              : undefined
                        }
                      >
                        {row.request_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(row);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          Detail
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => printTimeOffLetter(row)}
                        >
                          <Printer />
                          Cetak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Tidak ada pengajuan cuti.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data && (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {data.data.length} dari {data.paging.total_item} data
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                Baris per halaman
              </span>
              <Select
                value={search.size?.toString() ?? "10"}
                onValueChange={handleSize}
              >
                <SelectTrigger
                  className="w-20"
                  size="sm"
                  aria-label="Baris per halaman"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className="flex items-center gap-1"
              aria-label="Navigasi halaman"
            >
              <span className="mr-2 whitespace-nowrap text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman pertama"
                disabled={currentPage <= 1}
                onClick={() => handlePaginate(1)}
              >
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman sebelumnya"
                disabled={currentPage <= 1}
                onClick={() => handlePaginate(currentPage - 1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman berikutnya"
                disabled={currentPage >= totalPages}
                onClick={() => handlePaginate(currentPage + 1)}
              >
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman terakhir"
                disabled={currentPage >= totalPages}
                onClick={() => handlePaginate(totalPages)}
              >
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      )}

      <TimeOffDetailModal
        request={selectedRequest}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}
