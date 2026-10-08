"use client";

import { Input } from "@/components/ui/input";
import { CreateShiftSchema, WEEKDAY_LABELS } from "../schemas/shift-schema";
import { useZodForm } from "@/hooks/use-zod-form";

type ShiftForm = ReturnType<typeof useZodForm<typeof CreateShiftSchema>>;

const SHIFT_TIME_ZONE = "Asia/Jakarta";

export function ShiftFormFields({ form }: { form: ShiftForm }) {
  const shiftDays = form.watch("shift_days");

  const toggleDayType = (index: number) => {
    const current = shiftDays[index].day_type;
    form.setValue(
      `shift_days.${index}.day_type`,
      current === "workday" ? "offday" : "workday",
      { shouldDirty: true },
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="shift-name" className="text-sm font-medium">
            Nama Shift
          </label>
          <Input id="shift-name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="shift-late-tolerance" className="text-sm font-medium">
            Toleransi Terlambat (menit)
          </label>
          <Input
            id="shift-late-tolerance"
            type="number"
            min="0"
            {...form.register("late_tolerance")}
          />
          {form.formState.errors.late_tolerance && (
            <p className="text-sm text-destructive">
              {form.formState.errors.late_tolerance.message}
            </p>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Jadwal Harian</h3>
          <p className="text-sm text-muted-foreground">
            Atur jam kerja dan waktu istirahat untuk setiap hari.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border">
          <div className="min-w-[950px]">
            <div className="grid grid-cols-[100px_90px_repeat(4,minmax(115px,1fr))_100px] gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
              <span>Hari</span>
              <span>Tipe</span>
              <span>Masuk</span>
              <span>Keluar</span>
              <span>Istirahat Mulai</span>
              <span>Istirahat Selesai</span>
              <span>Maks (mnt)</span>
            </div>
            {shiftDays.map((day, index) => {
              const isWorkday = day.day_type === "workday";
              return (
                <div
                  key={day.weekday}
                  className={`grid grid-cols-[100px_90px_repeat(4,minmax(115px,1fr))_100px] items-center gap-2 border-b px-3 py-2 last:border-0 ${
                    isWorkday ? "" : "bg-muted/30"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {WEEKDAY_LABELS[index]}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDayType(index)}
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                      isWorkday
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isWorkday ? "Kerja" : "Libur"}
                  </button>
                  {(
                    [
                      ["check_in", "Jam masuk"],
                      ["check_out", "Jam keluar"],
                      ["break_start", "Istirahat mulai"],
                      ["break_end", "Istirahat selesai"],
                    ] as const
                  ).map(([field, label]) => (
                    <Input
                      key={field}
                      type="time"
                      lang="id-ID"
                      data-timezone={SHIFT_TIME_ZONE}
                      aria-label={`${label} ${WEEKDAY_LABELS[index]}`}
                      disabled={!isWorkday}
                      className="h-9"
                      {...form.register(`shift_days.${index}.${field}`)}
                    />
                  ))}
                  <Input
                    type="number"
                    min="0"
                    aria-label={`Maksimal istirahat ${WEEKDAY_LABELS[index]}`}
                    disabled={!isWorkday}
                    className="h-9"
                    {...form.register(
                      `shift_days.${index}.max_break_minutes`,
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
