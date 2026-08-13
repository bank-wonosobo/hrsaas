"use client";
import Button from "@/components/ui/button/button";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useCreateShift } from "../hooks/use-create-shift";
import {
  CreateShift,
  CreateShiftSchema,
  DEFAULT_SHIFT_DAYS,
  WEEKDAY_LABELS,
} from "../schemas/shift-schema";

export function FormShift() {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreateShiftSchema, {
    defaultValues: {
      name: "",
      late_tolerance: 0,
      shift_days: DEFAULT_SHIFT_DAYS,
    },
  });

  const shiftDays = form.watch("shift_days");
  const mutation = useCreateShift();

  const onSubmit = (data: CreateShift) => {
    mutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset({
          name: "",
          late_tolerance: 0,
          shift_days: DEFAULT_SHIFT_DAYS,
        });
      },
    });
  };

  const toggleDayType = (index: number) => {
    const current = shiftDays[index].day_type;
    form.setValue(
      `shift_days.${index}.day_type`,
      current === "workday" ? "offday" : "workday",
    );
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        prefixIcon={<PlusCircle size={18} />}
      >
        Tambah
      </Button>

      <Modal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          form.reset({
            name: "",
            late_tolerance: 0,
            shift_days: DEFAULT_SHIFT_DAYS,
          });
        }}
        title="Tambah Shift"
        maxWidth="xl"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-6">
          {/* Nama & Toleransi */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Shift"
              type="text"
              {...form.register("name")}
              error={form.formState.errors.name?.message}
            />
            <Input
              label="Toleransi Terlambat (menit)"
              type="number"
              min="0"
              {...form.register("late_tolerance")}
              error={form.formState.errors.late_tolerance?.message}
            />
          </div>

          {/* Shift Days */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-700">Jadwal Harian</p>
            <div className="rounded-xl border border-zinc-200 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[100px_90px_1fr_1fr_1fr_1fr_80px] gap-2 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-500 border-b border-zinc-200">
                <span>Hari</span>
                <span>Tipe</span>
                <span>Masuk</span>
                <span>Keluar</span>
                <span>Istirahat Mulai</span>
                <span>Istirahat Selesai</span>
                <span>Maks (mnt)</span>
              </div>

              {shiftDays.map((day, i) => {
                const isWorkday = day.day_type === "workday";
                return (
                  <div
                    key={day.weekday}
                    className={`grid grid-cols-[100px_90px_1fr_1fr_1fr_1fr_80px] gap-2 px-3 py-2 items-center border-b border-zinc-100 last:border-0 ${!isWorkday ? "bg-zinc-50" : ""}`}
                  >
                    {/* Hari */}
                    <span className="text-sm font-medium">
                      {WEEKDAY_LABELS[i]}
                    </span>

                    {/* Toggle workday/offday */}
                    <button
                      type="button"
                      onClick={() => toggleDayType(i)}
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                        isWorkday
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {isWorkday ? "Kerja" : "Libur"}
                    </button>

                    {/* Time inputs — disabled when offday */}
                    <input
                      type="time"
                      lang="id-ID"
                      disabled={!isWorkday}
                      {...form.register(`shift_days.${i}.check_in`)}
                      className="text-sm border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-black disabled:bg-zinc-50 disabled:text-zinc-300 w-full"
                    />
                    <input
                      type="time"
                      lang="id-ID"
                      disabled={!isWorkday}
                      {...form.register(`shift_days.${i}.check_out`)}
                      className="text-sm border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-black disabled:bg-zinc-50 disabled:text-zinc-300 w-full"
                    />
                    <input
                      type="time"
                      lang="id-ID"
                      disabled={!isWorkday}
                      {...form.register(`shift_days.${i}.break_start`)}
                      className="text-sm border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-black disabled:bg-zinc-50 disabled:text-zinc-300 w-full"
                    />
                    <input
                      type="time"
                      lang="id-ID"
                      disabled={!isWorkday}
                      {...form.register(`shift_days.${i}.break_end`)}
                      className="text-sm border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-black disabled:bg-zinc-50 disabled:text-zinc-300 w-full"
                    />
                    <input
                      type="number"
                      min="0"
                      disabled={!isWorkday}
                      {...form.register(`shift_days.${i}.max_break_minutes`)}
                      className="text-sm border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-black disabled:bg-zinc-50 disabled:text-zinc-300 w-full"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <Button loading={mutation.isPending}>Simpan</Button>
        </form>
      </Modal>
    </>
  );
}
