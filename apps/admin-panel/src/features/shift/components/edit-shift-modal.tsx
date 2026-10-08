"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useZodForm } from "@/hooks/use-zod-form";
import { useUpdateShift } from "../hooks/use-update-shift";
import {
  CreateShiftSchema,
  DEFAULT_SHIFT_DAYS,
  Shift,
} from "../schemas/shift-schema";
import { getShiftById } from "../services/shift-service";
import { ShiftFormFields } from "./shift-form-fields";

interface Props {
  shift: Shift;
}

const toFormValues = (shift: Shift) => ({
  name: shift.name,
  late_tolerance: shift.late_tolerance,
  shift_days: DEFAULT_SHIFT_DAYS.map((defaultDay) => {
    const day = shift.shift_days?.find(
      (shiftDay) => shiftDay.weekday === defaultDay.weekday,
    );
    return day ? { ...day } : { ...defaultDay };
  }),
});

export function EditShiftModal({ shift }: Props) {
  const [open, setOpen] = useState(false);
  const detailQuery = useQuery({
    queryKey: ["shifts", shift.id],
    queryFn: () => getShiftById(shift.id),
    enabled: open,
  });
  const form = useZodForm(CreateShiftSchema, {
    defaultValues: toFormValues(shift),
  });
  const mutation = useUpdateShift(shift.id, () => setOpen(false));
  const currentShift = detailQuery.data?.data ?? shift;

  useEffect(() => {
    if (open && detailQuery.data?.data) {
      form.reset(toFormValues(detailQuery.data.data));
    }
  }, [detailQuery.data, form, open]);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (value) form.reset(toFormValues(shift));
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={`Edit shift ${shift.name}`}
        onClick={() => handleOpenChange(true)}
      >
        <Pencil />
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>
              Perbarui informasi dan jadwal {currentShift.name}.
            </DialogDescription>
          </DialogHeader>
          {detailQuery.isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Memuat detail shift...
            </p>
          ) : detailQuery.isError ? (
            <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
              Gagal memuat detail shift. Tutup dialog lalu coba kembali.
            </p>
          ) : (
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className="space-y-6"
            >
              <ShiftFormFields form={form} />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={mutation.isPending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
