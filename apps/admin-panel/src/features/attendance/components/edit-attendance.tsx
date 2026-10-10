"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Attendance, UpdateAttendance } from "../schemas/attendance-schema";
import { useUpdateAttendance } from "../hooks/use-update-attendance";
import { Pencil } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  attendance: Attendance;
}

type FormValues = {
  date: string;
  checkInTime: string;
  checkOutTime: string;
  totalWorkMinutes: string;
  totalBreakMinutes: string;
  status: UpdateAttendance["status"];
};

const STATUS_OPTIONS: { label: string; value: UpdateAttendance["status"] }[] = [
  { label: "Hadir", value: "HADIR" },
  { label: "Terlambat", value: "TERLAMBAT" },
  { label: "Terlambat pulang awal", value: "TERLAMBAT_PULANG_AWAL" },
  { label: "Alpha", value: "ALPHA" },
  { label: "Izin", value: "IZIN" },
  { label: "Sakit", value: "SAKIT" },
  { label: "Pending", value: "PENDING" },
];

function toLocalDateInput(milliseconds: number) {
  if (!milliseconds) return "";
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime())
    ? ""
    : new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 10);
}

function toLocalDateTimeInput(milliseconds: number) {
  if (!milliseconds) return "";
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime())
    ? ""
    : new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16);
}

function getFormValues(attendance: Attendance): FormValues {
  return {
    date: toLocalDateInput(attendance.date),
    checkInTime: toLocalDateTimeInput(attendance.check_in_time),
    checkOutTime: toLocalDateTimeInput(attendance.check_out_time),
    totalWorkMinutes: String(attendance.total_work_minutes),
    totalBreakMinutes: String(attendance.total_break_minutes),
    status:
      STATUS_OPTIONS.find((option) => option.value === attendance.status)
        ?.value ?? "HADIR",
  };
}

function dateInputToMilliseconds(value: string) {
  return new Date(`${value}T00:00:00`).getTime();
}

function dateTimeInputToMilliseconds(value: string) {
  return value ? new Date(value).getTime() : 0;
}

export default function EditAttendance({ attendance }: Props) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(() =>
    getFormValues(attendance),
  );
  const mutation = useUpdateAttendance();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request: UpdateAttendance = {
      date: dateInputToMilliseconds(values.date),
      check_in_time: dateTimeInputToMilliseconds(values.checkInTime),
      check_out_time: dateTimeInputToMilliseconds(values.checkOutTime),
      total_work_minutes: Number(values.totalWorkMinutes),
      total_break_minutes: Number(values.totalBreakMinutes),
      status: values.status,
    };

    if (
      !Number.isFinite(request.date) ||
      !Number.isFinite(request.check_in_time) ||
      !Number.isFinite(request.check_out_time) ||
      !Number.isInteger(request.total_work_minutes) ||
      request.total_work_minutes < 0 ||
      !Number.isInteger(request.total_break_minutes) ||
      request.total_break_minutes < 0
    ) {
      toast.error("Periksa kembali tanggal, waktu, dan durasi kehadiran.");
      return;
    }

    mutation.mutate(
      { id: attendance.id, request },
      {
        onSuccess: () => {
          toast.success("Data kehadiran berhasil diperbarui.");
          setOpen(false);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Gagal memperbarui data kehadiran.",
          );
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setValues(getFormValues(attendance));
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" aria-label="Edit kehadiran">
          <Pencil />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form className="space-y-5" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Edit kehadiran</DialogTitle>
            <DialogDescription>
              Perbarui tanggal, waktu, durasi kerja, dan status presensi{" "}
              {attendance.employee_name ?? "karyawan"}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`attendance-date-${attendance.id}`}>Tanggal</Label>
              <Input
                id={`attendance-date-${attendance.id}`}
                type="date"
                required
                value={values.date}
                disabled={mutation.isPending}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`attendance-status-${attendance.id}`}>
                Status
              </Label>
              <select
                id={`attendance-status-${attendance.id}`}
                className="h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-sm"
                value={values.status}
                disabled={mutation.isPending}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    status:
                      STATUS_OPTIONS.find(
                        (option) => option.value === event.target.value,
                      )?.value ?? "HADIR",
                  }))
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`attendance-checkin-${attendance.id}`}>
                Check-in
              </Label>
              <Input
                id={`attendance-checkin-${attendance.id}`}
                type="datetime-local"
                value={values.checkInTime}
                disabled={mutation.isPending}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    checkInTime: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`attendance-checkout-${attendance.id}`}>
                Check-out
              </Label>
              <Input
                id={`attendance-checkout-${attendance.id}`}
                type="datetime-local"
                value={values.checkOutTime}
                disabled={mutation.isPending}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    checkOutTime: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`attendance-work-${attendance.id}`}>
                Total jam kerja (menit)
              </Label>
              <Input
                id={`attendance-work-${attendance.id}`}
                type="number"
                min={0}
                step={1}
                required
                value={values.totalWorkMinutes}
                disabled={mutation.isPending}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    totalWorkMinutes: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`attendance-break-${attendance.id}`}>
                Total istirahat (menit)
              </Label>
              <Input
                id={`attendance-break-${attendance.id}`}
                type="number"
                min={0}
                step={1}
                required
                value={values.totalBreakMinutes}
                disabled={mutation.isPending}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    totalBreakMinutes: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : "Simpan perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
