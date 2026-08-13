"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import InputDate from "@/components/ui/input/input-date";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
import { useSearchSalaryComponent } from "@/features/salary-component/hooks/use-search-salary-component";
import { useZodForm } from "@/hooks/use-zod-form";
import { mapToOptions } from "@/lib/utils";
import { Controller } from "react-hook-form";
import { useCreateEmployeeDeduction } from "../hooks/use-create-employee-deduction";
import {
  CreateEmployeeDeduction,
  CreateEmployeeDeductionSchema,
} from "../schemas/employee-deduction-schema";

interface Props {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FormEmployeeDeduction({ employeeId, isOpen, onClose }: Props) {
  const form = useZodForm(CreateEmployeeDeductionSchema, {
    defaultValues: {
      employee_id: employeeId,
      salary_component_id: "",
      amount: 0,
      percentage: 0,
      effective_date: "",
      end_date: "",
    },
  });

  const { data: componentData } = useSearchSalaryComponent({
    type: "DEDUCTION",
    active_only: true,
    page: 1,
    size: 100,
  });

  const componentOptions = mapToOptions(
    componentData?.data ?? [],
    (c) => c.name,
    (c) => c.id,
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const { mutate, isPending } = useCreateEmployeeDeduction(handleClose);

  const onSubmit = (data: CreateEmployeeDeduction) => {
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
      title="Tambah Potongan"
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-employee-deduction" loading={isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="form-employee-deduction"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField label="Komponen Potongan" required>
          <Controller
            name="salary_component_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Komponen Potongan"
                options={componentOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nominal (Rp)" hint="Isi salah satu: nominal atau %.">
            <Input
              label="Nominal (Rp)"
              type="number"
              min={0}
              {...form.register("amount")}
              error={form.formState.errors.amount?.message}
            />
          </FormField>
          <FormField label="Persentase (%)" hint="Dari gaji pokok.">
            <Input
              label="Persentase (%)"
              type="number"
              min={0}
              max={100}
              {...form.register("percentage")}
              error={form.formState.errors.percentage?.message}
            />
          </FormField>
        </div>

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
