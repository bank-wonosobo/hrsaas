"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import InputDate from "@/components/ui/input/input-date";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { Controller } from "react-hook-form";
import { useUpdateEmployeeAllowance } from "../hooks/use-update-employee-allowance";
import {
  EmployeeAllowance,
  UpdateEmployeeAllowance,
  UpdateEmployeeAllowanceSchema,
} from "../schemas/employee-allowance-schema";

interface Props {
  allowance: EmployeeAllowance;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditEmployeeAllowance({ allowance, isOpen, onClose }: Props) {
  const form = useZodForm(UpdateEmployeeAllowanceSchema, {
    values: {
      amount: allowance.amount,
      percentage: allowance.percentage,
      effective_date: new Date(allowance.effective_date).toISOString(),
      end_date: allowance.end_date ? new Date(allowance.end_date).toISOString() : "",
    },
  });

  const { mutate, isPending } = useUpdateEmployeeAllowance(onClose);

  const onSubmit = (data: UpdateEmployeeAllowance) => {
    mutate({ id: allowance.id, data: { ...data, end_date: data.end_date || undefined } });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Tunjangan${allowance.salary_component ? ` — ${allowance.salary_component.name}` : ""}`}
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-edit-employee-allowance" loading={isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="form-edit-employee-allowance"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
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
