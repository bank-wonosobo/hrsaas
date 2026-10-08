"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Eye, Users } from "lucide-react";
import { useState } from "react";
import { Shift, WEEKDAY_LABELS } from "../schemas/shift-schema";
import { getShiftById } from "../services/shift-service";

interface Props {
  shift: Shift;
}

export function DetailShiftModal({ shift }: Props) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["shifts", shift.id],
    queryFn: () => getShiftById(shift.id),
    enabled: open,
  });
  const detail = data?.data ?? shift;
  const days = [...(detail.shift_days ?? [])].sort(
    (left, right) => left.weekday - right.weekday,
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={`Lihat detail shift ${shift.name}`}
        onClick={() => setOpen(true)}
      >
        <Eye />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{detail.name}</DialogTitle>
            <DialogDescription>
              Detail jam kerja dan karyawan yang ditugaskan pada shift ini.
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Memuat detail shift...
            </p>
          ) : isError ? (
            <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
              Gagal memuat detail shift. Tutup dialog lalu coba kembali.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">
                    Toleransi terlambat
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {detail.late_tolerance} menit
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    Karyawan ter-assign
                  </div>
                  <p className="mt-1 text-lg font-semibold">
                    {detail.employees?.length ?? 0} karyawan
                  </p>
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Jadwal Mingguan</h3>
                {days.length === 0 ? (
                  <p className="rounded-xl border p-4 text-sm text-muted-foreground">
                    Jadwal harian belum tersedia.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-xl border">
                    {days.map((day) => (
                      <div
                        key={day.weekday}
                        className="flex flex-wrap items-center justify-between gap-3 border-b p-3 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-sm font-medium">
                            {WEEKDAY_LABELS[day.weekday - 1]}
                          </span>
                          <Badge
                            variant={
                              day.day_type === "workday"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {day.day_type === "workday" ? "Kerja" : "Libur"}
                          </Badge>
                        </div>
                        {day.day_type === "workday" ? (
                          <div className="text-right text-sm">
                            <p className="font-medium">
                              {day.check_in?.slice(0, 5) || "—"} –{" "}
                              {day.check_out?.slice(0, 5) || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Istirahat{" "}
                              {day.break_start?.slice(0, 5) || "—"} –{" "}
                              {day.break_end?.slice(0, 5) || "—"} · Maks{" "}
                              {day.max_break_minutes} menit
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Tidak ada jam kerja
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">
                  Karyawan ({detail.employees?.length ?? 0})
                </h3>
                {detail.employees?.length ? (
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border p-3">
                    {detail.employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="truncate font-medium">
                          {employee.fullname}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {employee.employee_number}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border p-4 text-sm text-muted-foreground">
                    Belum ada karyawan yang ditugaskan.
                  </p>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
