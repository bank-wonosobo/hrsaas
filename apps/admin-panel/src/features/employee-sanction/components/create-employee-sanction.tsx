"use client";

import Button from "@/components/ui/button/button";
import FileUploader from "@/components/ui/file-uploader/file-uploader";
import FormField from "@/components/ui/form/form-field";
import InputDate from "@/components/ui/input-date/input-date";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import SelectSearch from "@/components/ui/select-search/select-search";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { useZodForm } from "@/hooks/use-zod-form";
import { mapToOptions } from "@/lib/utils";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useCreateEmployeeSanction } from "../hooks/use-create-employee-sanction";
import { useGetSanctionTypes } from "../hooks/use-get-sanction-types";
import {
  CreateEmployeeSanction,
  CreateEmployeeSanctionSchema,
} from "../schemas/employee-sanction-schema";

export function CreateEmployeeSanctionForm() {
  const [open, setOpen] = useState(false);

  const { data: employees } = useGetEmployees({ size: 500 });
  const { data: sanctionTypes } = useGetSanctionTypes();

  const employeeOptions = mapToOptions(
    employees?.data ?? [],
    (e) => e.fullname,
    (e) => e.id,
  );

  const sanctionOptions = mapToOptions(
    sanctionTypes?.data ?? [],
    (s) => s.name,
    (s) => s.id,
  );

  const form = useZodForm(CreateEmployeeSanctionSchema, {
    defaultValues: {
      employee_id: "",
      sanction_id: "",
      reason: "",
      start_date: "",
      end_date: "",
      document_url: "",
    },
  });

  const mutation = useCreateEmployeeSanction(() => {
    setOpen(false);
    form.reset();
  });

  const onSubmit = (data: CreateEmployeeSanction) => {
    mutation.mutate(data);
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
        onClose={() => setOpen(false)}
        title="Tambah Sanksi Karyawan"
        maxWidth="sm"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-5">
          <FormField label="Karyawan">
            <Controller
              name="employee_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Pilih karyawan"
                  options={employeeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Jenis Sanksi">
            <Controller
              name="sanction_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Pilih jenis sanksi"
                  options={sanctionOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Alasan">
            <Input
              label="Alasan sanksi"
              type="text"
              {...form.register("reason")}
              error={form.formState.errors.reason?.message}
            />
          </FormField>

          <FormField label="Tanggal Berlaku">
            <Controller
              name="start_date"
              control={form.control}
              render={({ field }) => (
                <InputDate
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) =>
                    field.onChange(format(date, "yyyy-MM-dd"))
                  }
                />
              )}
            />
          </FormField>

          <FormField label="Tanggal Akhir">
            <Controller
              name="end_date"
              control={form.control}
              render={({ field }) => (
                <InputDate
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) =>
                    field.onChange(format(date, "yyyy-MM-dd"))
                  }
                />
              )}
            />
          </FormField>

          <FormField label="Dokumen">
            <Controller
              name="document_url"
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

          <Button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
