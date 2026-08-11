"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import InputDate from "@/components/ui/input/input-date";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { Controller } from "react-hook-form";
import { useCreateEmployeeSalary } from "../hooks/use-create-employee-salary";
import {
  CreateEmployeeSalary,
  CreateEmployeeSalarySchema,
} from "../schemas/employee-salary-schema";

interface Props {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FormEmployeeSalary({ employeeId, isOpen, onClose }: Props) {
  const form = useZodForm(CreateEmployeeSalarySchema, {
    defaultValues: {
      employee_id: employeeId,
      basic_salary: 0,
      effective_date: "",
      end_date: "",
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const { mutate, isPending } = useCreateEmployeeSalary(handleClose);

  const onSubmit = (data: CreateEmployeeSalary) => {
    mutate({
      ...data,
      employee_id: employeeId,
      end_date: data.end_date || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Gaji Pokok"
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-employee-salary" loading={isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="form-employee-salary"
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
