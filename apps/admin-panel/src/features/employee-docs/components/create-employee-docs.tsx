"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FileUploader from "@/components/ui/file-uploader/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useCreateEmployeeDocument } from "../hooks/use-create-employee-docs";
import {
  CreateEmployeeDocument,
  CreateEmployeeDocumentSchema,
} from "../schemas/employee-docs-schema";

const DOC_TYPE_OPTIONS = [
  { label: "Surat Keputusan", value: "SK" },
  { label: "Dokumen Kontrak", value: "Kontrak" },
  { label: "KTP", value: "KTP" },
  { label: "SIM", value: "SIM" },
  { label: "Paspor", value: "Paspor" },
  { label: "Ijazah", value: "Ijazah" },
  { label: "SKCK", value: "SKCK" },
  { label: "NPWP", value: "NPWP" },
  { label: "Kartu Keluarga", value: "KK" },
  { label: "Lainnya", value: "Lainnya" },
];

const EMPTY_VALUES = {
  doc_type: "",
  doc_name: "",
  doc_number: "",
  issued: "",
  file_url: "",
};

interface Props {
  employeeId: string;
}

export function CreateEmployeeDocsForm({ employeeId }: Props) {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreateEmployeeDocumentSchema, {
    defaultValues: { employee_id: employeeId, ...EMPTY_VALUES },
  });

  const mutation = useCreateEmployeeDocument(() => {
    setOpen(false);
    form.reset({ employee_id: employeeId, ...EMPTY_VALUES });
  });

  const onSubmit = (data: CreateEmployeeDocument) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <PlusCircle size={16} /> Tambah Dokumen
      </Button>

      <Dialog open={open} onOpenChange={(value) => { if (!value) setOpen(false); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Dokumen Karyawan</DialogTitle>
            <DialogDescription>Tambahkan dokumen dan file pendukung karyawan.</DialogDescription>
          </DialogHeader>
          <form id="form-employee-docs" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc_type">Tipe Dokumen <span className="text-destructive">*</span></Label>
            <Controller name="doc_type" control={form.control} render={({ field, fieldState }) => (
              <div className="space-y-1">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="doc_type" className="w-full" aria-invalid={!!fieldState.error}><SelectValue placeholder="Pilih tipe dokumen" /></SelectTrigger>
                  <SelectContent>{DOC_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                </Select>
                {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
              </div>
            )} />
          </div>
          {([
            ["doc_name", "Nama Dokumen", "text"],
            ["doc_number", "Nomor Dokumen", "text"],
            ["issued", "Tanggal Terbit", "date"],
          ] as const).map(([name, label, type]) => (
            <div className="space-y-2" key={name}>
              <Label htmlFor={name}>{label} <span className="text-destructive">*</span></Label>
              <Input id={name} type={type} {...form.register(name)} aria-invalid={!!form.formState.errors[name]} />
              {form.formState.errors[name] && <p className="text-sm text-destructive">{form.formState.errors[name]?.message}</p>}
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="file_url">File Dokumen <span className="text-destructive">*</span></Label>
            <Controller name="file_url" control={form.control} render={({ field, fieldState }) => (
              <FileUploader value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
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
              form="form-employee-docs"
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
