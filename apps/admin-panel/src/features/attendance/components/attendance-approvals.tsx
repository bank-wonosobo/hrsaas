"use client";

import { Pagination } from "@/components/shared/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { usePendingAttendanceLogs } from "@/features/attendance/hooks/use-pending-attendance-logs";
import { useReviewAttendanceLog } from "@/features/attendance/hooks/use-review-attendance-log";
import { AttendanceLog } from "@/features/attendance/schemas/attendance-schema";
import { PaginatedData } from "@/lib/response";
import { Check, ImageIcon, MapPin, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState, type ReactNode } from "react";
import toast from "react-hot-toast";

type Props = {
  page: number;
  size: number;
};

type ReviewTarget = {
  log: AttendanceLog;
  approve: boolean;
};

function formatLogTime(value: number) {
  if (!value) return "–";
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isPaginatedData(
  value: PaginatedData<AttendanceLog> | undefined,
): value is PaginatedData<AttendanceLog> {
  return Boolean(value?.paging && Array.isArray(value.data));
}

function PreviewDialog({
  title,
  description,
  trigger,
  children,
}: {
  title: string;
  description: string;
  trigger: ReactNode;
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default function AttendanceApprovals({ page, size }: Props) {
  const router = useRouter();
  const [target, setTarget] = useState<ReviewTarget | null>(null);
  const [reasons, setReasons] = useState("");
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePendingAttendanceLogs({ page, size });
  const reviewMutation = useReviewAttendanceLog();

  function closeDialog() {
    if (reviewMutation.isPending) return;
    setTarget(null);
    setReasons("");
  }

  function openReview(log: AttendanceLog, approve: boolean) {
    setReasons("");
    setTarget({ log, approve });
  }

  function changePage(nextPage: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(nextPage));
    params.set("size", String(size));
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function changeSize(nextSize: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("size", String(nextSize));
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!target) return;

    if (!target.approve && !reasons.trim()) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }

    reviewMutation.mutate(
      {
        logID: target.log.id,
        request: {
          approve: target.approve,
          reasons: reasons.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success(
            target.approve
              ? "Kehadiran berhasil disetujui."
              : "Kehadiran berhasil ditolak.",
          );
          setTarget(null);
          setReasons("");
        },
        onError: (reviewError) => {
          toast.error(
            reviewError instanceof Error
              ? reviewError.message
              : "Gagal memproses persetujuan kehadiran.",
          );
        },
      },
    );
  }

  const pendingLogs = isPaginatedData(data) ? data.data : [];

  return (
    <div className="space-y-5 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>Daftar kehadiran menunggu persetujuan</CardTitle>
          <CardDescription>
            Tinjau data kehadiran dan hasil verifikasi sebelum menyetujui atau
            menolaknya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Gagal memuat daftar persetujuan kehadiran."}
              </p>
              <Button variant="outline" onClick={() => void refetch()}>
                Coba lagi
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Verifikasi</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Selfie</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLogs.length > 0 ? (
                    pendingLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatLogTime(log.time)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.employee_name || "–"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              log.type.includes("IN")
                                ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950"
                                : "border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950"
                            }
                          >
                            {log.type.replaceAll("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            <Badge
                              variant="outline"
                              className={
                                log.is_face_verified
                                  ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950"
                                  : "border-red-600/30 bg-red-50 text-red-700 dark:bg-red-950"
                              }
                            >
                              Wajah:{" "}
                              {log.is_face_verified
                                ? "Terverifikasi"
                                : "Tidak terverifikasi"}
                            </Badge>
                            <br />
                            <Badge
                              variant="outline"
                              className={
                                log.is_location_verified
                                  ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950"
                                  : "border-red-600/30 bg-red-50 text-red-700 dark:bg-red-950"
                              }
                            >
                              Lokasi:{" "}
                              {log.is_location_verified
                                ? "Terverifikasi"
                                : "Tidak terverifikasi"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <PreviewDialog
                            title="Preview lokasi"
                            description={`Lokasi kehadiran: ${log.lat.toFixed(6)}, ${log.lng.toFixed(6)}`}
                            trigger={
                              <Button type="button" variant="outline" size="sm">
                                <MapPin />
                                Lihat lokasi
                              </Button>
                            }
                          >
                            <div className="space-y-3">
                              <iframe
                                title="Peta lokasi kehadiran"
                                src={`https://maps.google.com/maps?q=${log.lat},${log.lng}&z=15&output=embed`}
                                className="h-80 w-full rounded-xl border"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                              />
                              <a
                                href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary underline"
                              >
                                Buka di Google Maps
                              </a>
                            </div>
                          </PreviewDialog>
                        </TableCell>
                        <TableCell>
                          {log.face_image_url ? (
                            <PreviewDialog
                              title="Preview selfie"
                              description="Foto selfie saat melakukan presensi."
                              trigger={
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                >
                                  <ImageIcon />
                                  Lihat selfie
                                </Button>
                              }
                            >
                              <Image
                                src={log.face_image_url}
                                alt="Selfie kehadiran"
                                width={1200}
                                height={1200}
                                unoptimized
                                className="max-h-[70vh] w-full rounded-xl object-contain"
                              />
                            </PreviewDialog>
                          ) : (
                            "–"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={isFetching || reviewMutation.isPending}
                              onClick={() => openReview(log, true)}
                            >
                              <Check />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isFetching || reviewMutation.isPending}
                              onClick={() => openReview(log, false)}
                            >
                              <X />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Tidak ada kehadiran yang menunggu persetujuan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {isPaginatedData(data) && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Menampilkan {data.data.length} dari{" "}
                      {data.paging.total_item} data
                    </span>
                    <label className="flex items-center gap-2">
                      Baris
                      <select
                        aria-label="Baris per halaman"
                        className="h-9 rounded-lg border border-input bg-background px-2 text-foreground"
                        value={size}
                        onChange={(event) =>
                          changeSize(Number(event.target.value))
                        }
                      >
                        {[10, 25, 50, 100].map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <Pagination
                    paging={data.paging}
                    currentPage={page}
                    onPageChange={changePage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <form className="space-y-5" onSubmit={submitReview}>
            <DialogHeader>
              <DialogTitle>
                {target?.approve ? "Setujui kehadiran?" : "Tolak kehadiran?"}
              </DialogTitle>
              <DialogDescription>
                {target?.approve
                  ? "Catatan bersifat opsional."
                  : "Masukkan alasan penolakan kehadiran ini."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="attendance-review-reasons">
                Catatan{target?.approve ? " (opsional)" : " penolakan"}
              </Label>
              <Textarea
                id="attendance-review-reasons"
                value={reasons}
                onChange={(event) => setReasons(event.target.value)}
                placeholder={
                  target?.approve
                    ? "Tambahkan catatan jika diperlukan"
                    : "Tuliskan alasan penolakan"
                }
                aria-required={!target?.approve}
                disabled={reviewMutation.isPending}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={reviewMutation.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant={target?.approve ? "default" : "destructive"}
                disabled={
                  reviewMutation.isPending ||
                  (!target?.approve && !reasons.trim())
                }
              >
                {reviewMutation.isPending
                  ? "Memproses..."
                  : target?.approve
                    ? "Ya, approve"
                    : "Ya, reject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
