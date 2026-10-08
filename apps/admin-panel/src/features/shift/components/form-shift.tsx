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
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useCreateShift } from "../hooks/use-create-shift";
import {
  CreateShift,
  CreateShiftSchema,
  DEFAULT_SHIFT_DAYS,
} from "../schemas/shift-schema";
import { ShiftFormFields } from "./shift-form-fields";

const createDefaultValues = () => ({
  name: "",
  late_tolerance: 0,
  shift_days: DEFAULT_SHIFT_DAYS.map((day) => ({ ...day })),
});

export function FormShift() {
  const [open, setOpen] = useState(false);
  const form = useZodForm(CreateShiftSchema, {
    defaultValues: createDefaultValues(),
  });
  const mutation = useCreateShift();

  const onSubmit = (data: CreateShift) => {
    mutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset(createDefaultValues());
      },
    });
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) form.reset(createDefaultValues());
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusCircle />
          Tambah Shift
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Tambah Shift</DialogTitle>
          <DialogDescription>
            Masukkan informasi shift dan jadwal kerja selama satu minggu.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              {mutation.isPending ? "Menyimpan..." : "Simpan Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
