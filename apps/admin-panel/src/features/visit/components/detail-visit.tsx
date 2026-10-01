"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="outline">
            Detail
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Kunjungan</DialogTitle>
            <DialogDescription>
              {visit.employee_name} · {visit.client_name} ·{" "}
              {toIDDate(new Date(visit.date))}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visit.details.map((detail) => {
              const isIn = detail.visit_type === "IN";
              const lat = parseFloat(detail.latitude);
              const lng = parseFloat(detail.longitude);
              const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
              const mapsUrl = hasCoords
                ? `https://www.google.com/maps?q=${lat},${lng}`
                : null;

              return (
                <div
                  key={detail.id}
                  className="space-y-3 rounded-xl border bg-card p-4"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        isIn
                          ? "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950"
                          : "border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950"
                      }
                    >
                      {isIn ? <ArrowDownCircle /> : <ArrowUpCircle />}
                      {isIn ? "Masuk" : "Keluar"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {detail.visit_at}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="space-y-1">
                      <p>{detail.address || "Alamat tidak tersedia"}</p>
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Buka di Google Maps
                        </a>
                      )}
                    </div>
                  </div>

                  {detail.note && (
                    <p className="text-sm text-muted-foreground">
                      {detail.note}
                    </p>
                  )}

                  {detail.file_url && (
                    <button
                      type="button"
                      aria-label="Lihat foto kunjungan"
                      className="relative size-28 overflow-hidden rounded-lg border"
                      onClick={() => setActivePhoto(detail.file_url)}
                    >
                      <Image
                        src={detail.file_url}
                        alt="Foto kunjungan"
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </button>
                  )}
                </div>
              );
            })}

            {visit.details.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground sm:col-span-2">
                Tidak ada detail kunjungan.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(activePhoto)}
        onOpenChange={(isOpen) => !isOpen && setActivePhoto(null)}
      >
        <DialogContent className="max-w-3xl border-0 bg-transparent p-2 shadow-none">
          <DialogTitle className="sr-only">Foto kunjungan</DialogTitle>
          {activePhoto && (
            <Image
              src={activePhoto}
              alt="Foto kunjungan"
              width={1200}
              height={900}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
