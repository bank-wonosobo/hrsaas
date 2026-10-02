"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FileUploader from "@/components/ui/file-uploader/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useCreateEmployeeTraining } from "../hooks/use-create-employee-training";
import {
  CreateEmployeeTraining,
  CreateEmployeeTrainingSchema,
} from "../schemas/employee-training-schema";

const EMPTY_VALUES = {
  training_name: "",
  organizer: "",
  start_date: "",
  end_date: "",
  certificate_url: "",
};

interface Props {
  employeeId: string;
}

export function CreateEmployeeTrainingForm({ employeeId }: Props) {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreateEmployeeTrainingSchema, {
    defaultValues: { employee_id: employeeId, ...EMPTY_VALUES },
  });

  const mutation = useCreateEmployeeTraining(() => {
    setOpen(false);
    form.reset({ employee_id: employeeId, ...EMPTY_VALUES });
  });

  const onSubmit = (data: CreateEmployeeTraining) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <PlusCircle size={16} /> Tambah Pelatihan
      </Button>

      <Dialog open={open} onOpenChange={(value) => { if (!value) setOpen(false); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tambah Riwayat Pelatihan</DialogTitle><DialogDescription>Isi informasi pelatihan dan sertifikat jika tersedia.</DialogDescription></DialogHeader>
          <form id="form-employee-training" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {([
            ["training_name", "Nama Pelatihan", "text"],
            ["organizer", "Penyelenggara", "text"],
            ["start_date", "Tanggal Mulai", "date"],
            ["end_date", "Tanggal Selesai", "date"],
          ] as const).map(([name, label, type]) => (
            <div className="space-y-2" key={name}>
              <Label htmlFor={name}>{label}{name !== "end_date" && <span className="text-destructive"> *</span>}</Label>
              <Input id={name} type={type} {...form.register(name)} aria-invalid={!!form.formState.errors[name]} />
              {form.formState.errors[name] && <p className="text-sm text-destructive">{form.formState.errors[name]?.message}</p>}
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="certificate_url">Sertifikat</Label>
            <Controller name="certificate_url" control={form.control} render={({ field, fieldState }) => (
              <FileUploader accept=".pdf,.jpg,.jpeg,.png" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
            )} />
          </div>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="form-employee-training"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
