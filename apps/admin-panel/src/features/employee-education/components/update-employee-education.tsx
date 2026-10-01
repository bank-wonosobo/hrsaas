"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useZodForm } from "@/hooks/use-zod-form";
import { Controller } from "react-hook-form";
import { useUpdateEmployeeEducation } from "../hooks/use-update-employee-education";
import {
  EmployeeEducation,
  UpdateEmployeeEducation,
  UpdateEmployeeEducationSchema,
} from "../schemas/employee-education-schema";

const EDUCATION_LEVEL_OPTIONS = [
  { label: "SD", value: "SD" },
  { label: "SMP", value: "SMP" },
  { label: "SMA/SMK", value: "SMA/SMK" },
  { label: "D1", value: "D1" },
  { label: "D2", value: "D2" },
  { label: "D3", value: "D3" },
  { label: "D4", value: "D4" },
  { label: "S1", value: "S1" },
  { label: "S2", value: "S2" },
  { label: "S3", value: "S3" },
];

interface Props {
  education: EmployeeEducation;
  open: boolean;
  onClose: () => void;
}

export function UpdateEmployeeEducationForm({ education, open, onClose }: Props) {
  const form = useZodForm(UpdateEmployeeEducationSchema, {
    values: {
      education_level: education.education_level,
      institution_name: education.institution_name,
      major: education.major,
      graduation_year: education.graduation_year
        ? new Date(education.graduation_year).toISOString().split("T")[0]
        : "",
      gpa: education.gpa ?? undefined,
      start_year: education.start_year ?? undefined,
      end_year: education.end_year ?? undefined,
    },
  });

  const mutation = useUpdateEmployeeEducation(() => {
    onClose();
  });

  const onSubmit = (data: UpdateEmployeeEducation) => {
    mutation.mutate({ id: education.id, data });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Riwayat Pendidikan</DialogTitle><DialogDescription>Perbarui informasi pendidikan karyawan.</DialogDescription></DialogHeader>
        <form id="form-update-employee-education" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="education_level">Jenjang Pendidikan <span className="text-destructive">*</span></Label>
          <Controller name="education_level" control={form.control} render={({ field, fieldState }) => (
            <div className="space-y-1">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="education_level" className="w-full" aria-invalid={!!fieldState.error}><SelectValue placeholder="Pilih jenjang pendidikan" /></SelectTrigger>
                <SelectContent>{EDUCATION_LEVEL_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
              </Select>
              {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </div>
          )} />
        </div>
        {([
          ["institution_name", "Nama Institusi", "text"],
          ["major", "Jurusan", "text"],
          ["graduation_year", "Tahun Lulus", "date"],
        ] as const).map(([name, label, type]) => (
          <div className="space-y-2" key={name}>
            <Label htmlFor={name}>{label} <span className="text-destructive">*</span></Label>
            <Input id={name} type={type} {...form.register(name)} aria-invalid={!!form.formState.errors[name]} />
            {form.formState.errors[name] && <p className="text-sm text-destructive">{form.formState.errors[name]?.message}</p>}
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          {([
            ["start_year", "Tahun Masuk", "number"],
            ["end_year", "Tahun Selesai", "number"],
            ["gpa", "IPK / Nilai", "number"],
          ] as const).map(([name, label, type]) => (
            <div className="space-y-2" key={name}>
              <Label htmlFor={name}>{label}</Label>
              <Input id={name} type={type} step={name === "gpa" ? "0.01" : undefined} {...form.register(name, { valueAsNumber: true })} aria-invalid={!!form.formState.errors[name]} />
              {form.formState.errors[name] && <p className="text-sm text-destructive">{form.formState.errors[name]?.message}</p>}
            </div>
          ))}
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
            form="form-update-employee-education"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
