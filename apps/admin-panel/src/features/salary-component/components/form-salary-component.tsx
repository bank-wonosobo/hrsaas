"use client";
import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
import Switch from "@/components/ui/switch/switch";
import { useZodForm } from "@/hooks/use-zod-form";
import { calculationTypeOptions, salaryComponentTypeOptions } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useCreateSalaryComponent } from "../hooks/use-create-salary-component";
import {
  CreateSalaryComponent,
  CreateSalaryComponentSchema,
} from "../schemas/salary-component-schema";

export function FormSalaryComponent() {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreateSalaryComponentSchema, {
    defaultValues: {
      code: "",
      name: "",
      type: undefined,
      calculation_type: undefined,
      is_taxable: false,
      is_bpjs_base: false,
    },
  });

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const { mutate, isPending } = useCreateSalaryComponent(handleClose);

  const onSubmit = (data: CreateSalaryComponent) => {
    mutate({ ...data, code: data.code.toUpperCase() });
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
        onClose={handleClose}
        title="Tambah Komponen Gaji"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={handleClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" form="form-salary-component" loading={isPending}>
              Simpan
            </Button>
          </>
        }
      >
        <form
          id="form-salary-component"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Kode" required>
              <Input
                label="Kode (mis. TRANSPORT)"
                {...form.register("code")}
                error={form.formState.errors.code?.message}
              />
            </FormField>
            <FormField label="Nama" required>
              <Input
                label="Nama Komponen"
                {...form.register("name")}
                error={form.formState.errors.name?.message}
              />
            </FormField>
          </div>

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
                description="Komponen ini dihitung sebagai objek pajak."
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
                description="Komponen ini menjadi dasar perhitungan BPJS."
                checked={!!field.value}
                onChange={field.onChange}
              />
            )}
          />
        </form>
      </Modal>
    </>
  );
}
