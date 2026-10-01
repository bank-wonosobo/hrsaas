"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FileUploader from "@/components/ui/file-uploader/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useZodForm } from "@/hooks/use-zod-form";
import { Controller } from "react-hook-form";
import { useUpdateEmployeeTraining } from "../hooks/use-update-employee-training";
import {
  EmployeeTraining,
  UpdateEmployeeTraining,
  UpdateEmployeeTrainingSchema,
} from "../schemas/employee-training-schema";

const tsToDate = (ms: number | null | undefined) =>
  ms ? new Date(ms).toISOString().split("T")[0] : "";

interface Props {
  training: EmployeeTraining;
  open: boolean;
  onClose: () => void;
}

export function UpdateEmployeeTrainingForm({ training, open, onClose }: Props) {
  const form = useZodForm(UpdateEmployeeTrainingSchema, {
    values: {
      training_name: training.training_name,
      organizer: training.organizer,
      start_date: tsToDate(training.start_date),
      end_date: tsToDate(training.end_date),
      certificate_url: training.certificate_url ?? "",
    },
  });

  const mutation = useUpdateEmployeeTraining(() => onClose());

  const onSubmit = (data: UpdateEmployeeTraining) => {
    mutation.mutate({ id: training.id, data });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Riwayat Pelatihan</DialogTitle><DialogDescription>Perbarui informasi pelatihan dan sertifikat.</DialogDescription></DialogHeader>
        <form id="form-update-employee-training" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="form-update-employee-training"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
