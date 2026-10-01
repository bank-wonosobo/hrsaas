"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  MapPin,
  Monitor,
  UserRound,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useGetAttendanceDetail } from "../hooks/use-get-attendance-detail";
import { Attendance } from "../schemas/attendance-schema";

interface Props {
  attendance: Attendance;
}

const STATUS_CLASSES: Record<string, string> = {
  HADIR:
    "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950",
  TERLAMBAT: "border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950",
  TIDAK_HADIR: "border-red-600/30 bg-red-50 text-red-700 dark:bg-red-950",
};

function formatTime(milliseconds: number) {
  if (!milliseconds) return "-";
  return new Date(milliseconds).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDateTime(milliseconds: number) {
  if (!milliseconds) return "-";
  return new Date(milliseconds).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number) {
  if (!minutes) return "-";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes} menit`;
  if (!remainingMinutes) return `${hours} jam`;
  return `${hours} jam ${remainingMinutes} menit`;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function VerificationItem({
  verified,
  label,
  detail,
}: {
  verified: boolean;
  label: string;
  detail?: string;
}) {
  const Icon = verified ? CheckCircle : XCircle;
  return (
    <div className="flex items-start gap-2 text-xs">
      <Icon
        className={`mt-0.5 size-4 ${verified ? "text-emerald-600" : "text-red-500"}`}
      />
      <div>
        <p className="font-medium">
          {label} {verified ? "terverifikasi" : "tidak terverifikasi"}
        </p>
        {detail && <p className="text-muted-foreground">{detail}</p>}
      </div>
    </div>
  );
}

export default function DetailAttendance({ attendance }: Props) {
  const [open, setOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const { data, isLoading } = useGetAttendanceDetail(
    open ? attendance.id : null,
  );
  const detail = data?.data;
  const metrics = [
    {
      label: "Check-in",
      value: formatTime(attendance.check_in_time),
      color: "text-emerald-600",
    },
    {
      label: "Check-out",
      value: formatTime(attendance.check_out_time),
      color: "text-orange-600",
    },
    {
      label: "Jam kerja",
      value: formatDuration(attendance.total_work_minutes),
      color: "text-blue-600",
    },
    {
      label: "Total istirahat",
      value: formatDuration(attendance.total_break_minutes),
      color: "text-violet-600",
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="secondary">
            Detail
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail kehadiran</DialogTitle>
            <DialogDescription>
              Informasi lengkap presensi dan riwayat verifikasi karyawan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <Card className="bg-muted/30 shadow-none">
              <CardContent className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {attendance.employee_name ?? attendance.employee_id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ID karyawan: {attendance.employee_id}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="size-3.5" /> Perusahaan:{" "}
                      {attendance.company_id}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <Badge
                    variant="outline"
                    className={STATUS_CLASSES[attendance.status]}
                  >
                    {formatLabel(attendance.status)}
                  </Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(attendance.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <Card key={metric.label} className="shadow-none">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Clock className={`size-4 ${metric.color}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="font-semibold">{metric.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Riwayat log presensi</h3>
                <p className="text-sm text-muted-foreground">
                  Detail waktu, lokasi, perangkat, dan hasil verifikasi.
                </p>
              </div>
              {isLoading ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Memuat log...
                </div>
              ) : !detail?.logs?.length ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Tidak ada log tersedia.
                </div>
              ) : (
                <div className="space-y-3">
                  {detail.logs.map((log) => {
                    const isCheckIn = log.type === "CHECK_IN";
                    const mapsUrl = `https://www.google.com/maps?q=${log.lat},${log.lng}`;
                    return (
                      <Card key={log.id} className="shadow-none">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                          <CardTitle className="text-sm">
                            <Badge
                              variant="outline"
                              className={
                                isCheckIn
                                  ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950"
                                  : "border-orange-600/30 bg-orange-50 text-orange-700 dark:bg-orange-950"
                              }
                            >
                              {isCheckIn
                                ? "Check-in"
                                : log.type === "CHECK_OUT"
                                  ? "Check-out"
                                  : formatLabel(log.type)}
                            </Badge>
                          </CardTitle>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(log.time)}
                          </span>
                        </CardHeader>
                        <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <div className="space-y-1 text-xs">
                              <p className="text-muted-foreground">
                                {log.lat.toFixed(6)}, {log.lng.toFixed(6)}
                              </p>
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Buka di Google Maps
                              </a>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Monitor className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <div className="text-xs">
                              <p className="text-muted-foreground">Perangkat</p>
                              <p>{log.device_info || "-"}</p>
                            </div>
                          </div>
                          <VerificationItem
                            verified={log.is_location_verified}
                            label="Lokasi"
                            detail={
                              log.location_distance > 0
                                ? `${log.location_distance.toFixed(0)} m dari titik kantor`
                                : undefined
                            }
                          />
                          <VerificationItem
                            verified={log.is_face_verified}
                            label="Wajah"
                            detail={
                              log.is_face_verified
                                ? `${(log.face_confidence * 100).toFixed(0)}% kecocokan`
                                : undefined
                            }
                          />
                          {log.face_image_url && (
                            <button
                              type="button"
                              className="group relative size-24 overflow-hidden rounded-lg border text-left"
                              onClick={() => setActivePhoto(log.face_image_url)}
                            >
                              <Image
                                src={log.face_image_url}
                                alt="Foto wajah presensi"
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                                unoptimized
                              />
                              <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                <ImageIcon className="size-5 text-white" />
                              </span>
                            </button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(activePhoto)}
        onOpenChange={(value) => !value && setActivePhoto(null)}
      >
        <DialogContent className="max-w-2xl p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>Foto wajah presensi</DialogTitle>
            <DialogDescription>
              Foto wajah yang diambil saat presensi.
            </DialogDescription>
          </DialogHeader>
          {activePhoto && (
            <Image
              src={activePhoto}
              alt="Foto wajah presensi"
              width={800}
              height={800}
              className="max-h-[80vh] w-full rounded-2xl object-contain"
              unoptimized
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
