"use client";
import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
import Switch from "@/components/ui/switch/switch";
import { useZodForm } from "@/hooks/use-zod-form";
import { calculationTypeOptions, salaryComponentTypeOptions } from "@/lib/data";
import { Controller } from "react-hook-form";
import { useUpdateSalaryComponent } from "../hooks/use-update-salary-component";
import {
  SalaryComponent,
  UpdateSalaryComponent,
  UpdateSalaryComponentSchema,
} from "../schemas/salary-component-schema";

interface Props {
  component: SalaryComponent;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditSalaryComponent({ component, isOpen, onClose }: Props) {
  const form = useZodForm(UpdateSalaryComponentSchema, {
    values: {
      name: component.name,
      type: component.type,
      calculation_type: component.calculation_type,
      is_taxable: component.is_taxable,
      is_bpjs_base: component.is_bpjs_base,
      is_active: component.is_active,
    },
  });

  const { mutate, isPending } = useUpdateSalaryComponent(onClose);

  const onSubmit = (data: UpdateSalaryComponent) => {
    mutate({ id: component.id, data });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Komponen Gaji"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-edit-salary-component" loading={isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="form-edit-salary-component"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField label="Kode">
          <Input label="Kode" value={component.code} disabled readOnly />
        </FormField>

        <FormField label="Nama" required>
          <Input
            label="Nama Komponen"
            {...form.register("name")}
            error={form.formState.errors.name?.message}
          />
        </FormField>

        <FormField label="Tipe" required>
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Tipe"
                options={salaryComponentTypeOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>

        <FormField label="Metode Perhitungan" required>
          <Controller
            name="calculation_type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Metode Perhitungan"
                options={calculationTypeOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>

        <Controller
          name="is_taxable"
          control={form.control}
          render={({ field }) => (
            <Switch
              label="Kena Pajak"
              checked={!!field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="is_bpjs_base"
          control={form.control}
          render={({ field }) => (
            <Switch
              label="Dasar BPJS"
              checked={!!field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="is_active"
          control={form.control}
          render={({ field }) => (
            <Switch
              label="Aktif"
              checked={!!field.value}
              onChange={field.onChange}
            />
          )}
        />
      </form>
    </Modal>
  );
}
