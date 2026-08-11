"use client";

import Button from "@/components/ui/button/button";
import FileUploader from "@/components/ui/file-uploader/file-uploader";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
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
        variant="secondary"
        size="sm"
        prefixIcon={<PlusCircle size={16} />}
        onClick={() => setOpen(true)}
      >
        Tambah Dokumen
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Tambah Dokumen Karyawan"
        maxWidth="md"
        footer={
          <>
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
              loading={mutation.isPending}
            >
              Simpan
            </Button>
          </>
        }
      >
        <form
          id="form-employee-docs"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField label="Tipe Dokumen" required>
            <Controller
              name="doc_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  label="Tipe Dokumen"
                  options={DOC_TYPE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Nama Dokumen" required>
            <Input
              label="Nama Dokumen"
              type="text"
              {...form.register("doc_name")}
              error={form.formState.errors.doc_name?.message}
            />
          </FormField>

          <FormField label="Nomor Dokumen" required>
            <Input
              label="Nomor Dokumen"
              type="text"
              {...form.register("doc_number")}
              error={form.formState.errors.doc_number?.message}
            />
          </FormField>

          <FormField label="Tanggal Terbit" required>
            <Input
              label="Tanggal Terbit"
              type="date"
              {...form.register("issued")}
              error={form.formState.errors.issued?.message}
            />
          </FormField>

          <FormField label="File Dokumen" required>
            <Controller
              name="file_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <FileUploader
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>
        </form>
      </Modal>
    </>
  );
}
