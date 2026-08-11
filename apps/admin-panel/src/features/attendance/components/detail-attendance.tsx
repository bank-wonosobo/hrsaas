"use client";

import Button from "@/components/ui/button/button";
import Modal from "@/components/ui/modal/modal";
import { CheckCircle, Clock, Image as ImageIcon, MapPin, Monitor, XCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useGetAttendanceDetail } from "../hooks/use-get-attendance-detail";
import { Attendance } from "../schemas/attendance-schema";

interface Props {
  attendance: Attendance;
}

const STATUS_STYLE: Record<string, string> = {
  HADIR: "bg-green-100 text-green-700",
  TERLAMBAT: "bg-yellow-100 text-yellow-700",
  TIDAK_HADIR: "bg-red-100 text-red-700",
};

function formatTime(ms: number) {
  if (!ms) return "-";
  return new Date(ms).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDateTime(ms: number) {
  if (!ms) return "-";
  return new Date(ms).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DetailAttendance({ attendance }: Props) {
  const [open, setOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const { data, isLoading } = useGetAttendanceDetail(open ? attendance.id : null);
  const detail = data?.data;

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Detail
      </Button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Detail Kehadiran" maxWidth="xl">
        {/* Header info */}
        <div className="mb-5 p-4 bg-zinc-50 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-base">
                {attendance.employee_name ?? attendance.employee_id}
              </p>
              <p className="text-sm text-zinc-500">
                {new Date(attendance.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLE[attendance.status] ?? "bg-zinc-100 text-zinc-600"}`}>
              {attendance.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-[11px] text-zinc-400 uppercase tracking-wide">Check-in</p>
                <p className="font-medium">{formatTime(attendance.check_in_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-red-400" />
              <div>
                <p className="text-[11px] text-zinc-400 uppercase tracking-wide">Check-out</p>
                <p className="font-medium">{formatTime(attendance.check_out_time)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logs */}
        {isLoading ? (
          <p className="text-sm text-zinc-400 text-center py-6">Memuat log...</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-zinc-600">Riwayat Log</p>

            {(!detail?.logs || detail.logs.length === 0) && (
              <p className="text-sm text-zinc-400 text-center py-6">Tidak ada log tersedia.</p>
            )}

            {detail?.logs?.map((log) => {
              const isCheckIn = log.type === "CHECK_IN";
              const mapsUrl = `https://www.google.com/maps?q=${log.lat},${log.lng}`;

              return (
                <div key={log.id} className="border rounded-xl p-4 space-y-3">
                  {/* Type + waktu */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${isCheckIn ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {isCheckIn ? "Check-in" : log.type === "CHECK_OUT" ? "Check-out" : log.type}
                    </span>
                    <span className="text-xs text-zinc-400">{formatDateTime(log.time)}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {/* Lokasi */}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-zinc-400" />
                      <div className="space-y-0.5">
                        <p className="text-zinc-500 text-xs">
                          {log.lat.toFixed(6)}, {log.lng.toFixed(6)}
                        </p>
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                          Buka di Google Maps
                        </a>
                      </div>
                    </div>

                    {/* Device */}
                    <div className="flex items-start gap-2">
                      <Monitor className="h-4 w-4 mt-0.5 shrink-0 text-zinc-400" />
                      <p className="text-zinc-500 text-xs">{log.device_info || "-"}</p>
                    </div>

                    {/* Verifikasi lokasi */}
                    <div className="flex items-center gap-2">
                      {log.is_location_verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <p className="text-xs text-zinc-500">
                        Lokasi {log.is_location_verified ? "terverifikasi" : "tidak terverifikasi"}
                        {log.location_distance > 0 && ` · ${log.location_distance.toFixed(0)} m`}
                      </p>
                    </div>

                    {/* Verifikasi wajah */}
                    <div className="flex items-center gap-2">
                      {log.is_face_verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <p className="text-xs text-zinc-500">
                        Wajah {log.is_face_verified ? `terverifikasi (${(log.face_confidence * 100).toFixed(0)}%)` : "tidak terverifikasi"}
                      </p>
                    </div>
                  </div>

                  {/* Foto wajah */}
                  {log.face_image_url && (
                    <div
                      className="relative w-24 h-24 rounded-lg overflow-hidden border cursor-pointer"
                      onClick={() => setActivePhoto(log.face_image_url)}
                    >
                      <Image
                        src={log.face_image_url}
                        alt="foto wajah"
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                        unoptimized
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                        <ImageIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Lightbox */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-w-lg w-full mx-4">
            <Image
              src={activePhoto}
              alt="foto wajah"
              width={600}
              height={600}
              className="rounded-xl object-contain max-h-[80vh] w-full"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}
