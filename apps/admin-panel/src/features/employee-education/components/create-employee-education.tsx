"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useCreateEmployeeEducation } from "../hooks/use-create-employee-education";
import {
  CreateEmployeeEducation,
  CreateEmployeeEducationSchema,
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

const EMPTY_VALUES = {
  education_level: "",
  institution_name: "",
  major: "",
  graduation_year: "",
  gpa: "",
  start_year: "",
  end_year: "",
};

interface Props {
  employeeId: string;
}

export function CreateEmployeeEducationForm({ employeeId }: Props) {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreateEmployeeEducationSchema, {
    defaultValues: { employee_id: employeeId, ...EMPTY_VALUES },
  });

  const mutation = useCreateEmployeeEducation(() => {
    setOpen(false);
    form.reset({ employee_id: employeeId, ...EMPTY_VALUES });
  });

  const onSubmit = (data: CreateEmployeeEducation) => {
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
        Tambah Pendidikan
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Tambah Riwayat Pendidikan"
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
              form="form-employee-education"
              loading={mutation.isPending}
            >
              Simpan
            </Button>
          </>
        }
      >
        <form
          id="form-employee-education"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField label="Jenjang Pendidikan" required>
            <Controller
              name="education_level"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  label="Pilih jenjang pendidikan"
                  options={EDUCATION_LEVEL_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Nama Institusi" required>
            <Input
              label="Nama institusi / sekolah"
              type="text"
              {...form.register("institution_name")}
              error={form.formState.errors.institution_name?.message}
            />
          </FormField>

          <FormField label="Jurusan" required>
            <Input
              label="Jurusan / bidang studi"
              type="text"
              {...form.register("major")}
              error={form.formState.errors.major?.message}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tahun Masuk">
              <Input
                label="Tahun masuk"
                type="number"
                {...form.register("start_year", { valueAsNumber: true })}
                error={form.formState.errors.start_year?.message}
              />
            </FormField>

            <FormField label="Tahun Lulus" required>
              <Input
                label="Tahun lulus"
                type="date"
                {...form.register("graduation_year")}
                error={form.formState.errors.graduation_year?.message}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tahun Selesai">
              <Input
                label="Tahun selesai"
                type="number"
                {...form.register("end_year", { valueAsNumber: true })}
                error={form.formState.errors.end_year?.message}
              />
            </FormField>

            <FormField label="IPK / Nilai">
              <Input
                label="IPK (maks. 4.00)"
                type="number"
                step="0.01"
                {...form.register("gpa", { valueAsNumber: true })}
                error={form.formState.errors.gpa?.message}
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </>
  );
}
