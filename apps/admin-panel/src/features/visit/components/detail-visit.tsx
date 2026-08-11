"use client";

import Button from "@/components/ui/button/button";
import Modal from "@/components/ui/modal/modal";
import toIDDate from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Visit } from "../schemas/visit-schema";

interface Props {
  visit: Visit;
}

export default function DetailVisit({ visit }: Props): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        detail
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Detail Kunjungan"
        maxWidth="xl"
      >
        {/* Info header */}
        <div className="mb-5 p-4 bg-gray-50 rounded-xl space-y-1">
          <p className="font-semibold text-base">{visit.employee_name}</p>
          <p className="text-sm text-gray-500">
            Klien: <span className="text-gray-700">{visit.client_name}</span>
          </p>
          <p className="text-sm text-gray-500">
            Tanggal:{" "}
            <span className="text-gray-700">
              {toIDDate(new Date(visit.date))}
            </span>
          </p>
        </div>

        {/* Detail list */}
        <div className="space-y-4 grid grid-cols-2 gap-4">
          {visit.details.map((detail) => {
            const isIn = detail.visit_type === "IN";
            const lat = parseFloat(detail.latitude);
            const lng = parseFloat(detail.longitude);
            const hasCoords = !isNaN(lat) && !isNaN(lng);
            const mapsUrl = hasCoords
              ? `https://www.google.com/maps?q=${lat},${lng}`
              : null;

            return (
              <div key={detail.id} className="border rounded-xl p-4 space-y-3">
                {/* Badge + waktu */}
                <div className="flex items-center gap-2">
                  {isIn ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      <ArrowDownCircle size={13} /> Masuk
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                      <ArrowUpCircle size={13} /> Keluar
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {detail.visit_at}
                  </span>
                </div>

                {/* Alamat + lokasi */}
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
                  <div className="space-y-0.5">
                    <p>{detail.address || "Alamat tidak tersedia"}</p>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Buka di Google Maps
                      </a>
                    )}
                  </div>
                </div>

                {/* Catatan */}
                {detail.note && (
                  <p className="text-sm text-gray-500 italic">
                    &ldquo;{detail.note}&rdquo;
                  </p>
                )}

                {/* Foto */}
                {detail.file_url && (
                  <div
                    className="relative w-28 h-28 rounded-lg overflow-hidden cursor-pointer border"
                    onClick={() => setActivePhoto(detail.file_url)}
                  >
                    <Image
                      src={detail.file_url}
                      alt="foto kunjungan"
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {visit.details.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Tidak ada detail kunjungan.
            </p>
          )}
        </div>
      </Modal>

      {/* Lightbox foto */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-w-2xl w-full mx-4">
            <Image
              src={activePhoto}
              alt="foto kunjungan"
              width={800}
              height={600}
              className="rounded-xl object-contain max-h-[80vh] w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
