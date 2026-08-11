"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
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
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Edit Riwayat Pendidikan"
      maxWidth="md"
      footer={
        <>
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
            loading={mutation.isPending}
          >
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="form-update-employee-education"
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
  );
}
