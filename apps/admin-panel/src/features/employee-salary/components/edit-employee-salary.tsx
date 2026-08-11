"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import InputDate from "@/components/ui/input/input-date";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { Controller } from "react-hook-form";
import { useUpdateEmployeeSalary } from "../hooks/use-update-employee-salary";
import {
  EmployeeSalary,
  UpdateEmployeeSalary,
  UpdateEmployeeSalarySchema,
} from "../schemas/employee-salary-schema";

interface Props {
  salary: EmployeeSalary;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditEmployeeSalary({ salary, isOpen, onClose }: Props) {
  const form = useZodForm(UpdateEmployeeSalarySchema, {
    values: {
      basic_salary: salary.basic_salary,
      effective_date: new Date(salary.effective_date).toISOString(),
      end_date: salary.end_date ? new Date(salary.end_date).toISOString() : "",
    },
  });

  const { mutate, isPending } = useUpdateEmployeeSalary(onClose);

  const onSubmit = (data: UpdateEmployeeSalary) => {
    mutate({ id: salary.id, data: { ...data, end_date: data.end_date || undefined } });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Gaji Pokok"
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-edit-employee-salary" loading={isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="form-edit-employee-salary"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField label="Gaji Pokok" required>
          <Input
            label="Gaji Pokok (Rp)"
            type="number"
            min={0}
            {...form.register("basic_salary")}
            error={form.formState.errors.basic_salary?.message}
          />
        </FormField>

        <FormField label="Berlaku Sejak" required>
          <Controller
            name="effective_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputDate
                label="Berlaku Sejak"
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) => field.onChange(date.toISOString())}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>

        <FormField label="Berlaku Sampai" hint="Kosongkan jika masih berlaku.">
          <Controller
            name="end_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputDate
                label="Berlaku Sampai"
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) => field.onChange(date.toISOString())}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>
      </form>
    </Modal>
  );
}
