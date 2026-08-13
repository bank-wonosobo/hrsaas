"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
import Switch from "@/components/ui/switch/switch";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useCreateTimeOffType } from "../hooks/use-create-time-off-type";
import {
  CreateTimeOffType,
  CreateTimeOffTypeSchema,
} from "../schemas/time-off-type-schema";

export function CreateTimeOffTypeForm() {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreateTimeOffTypeSchema, {
    defaultValues: {
      name: "",
      category: "IZIN",
      is_quota_based: false,
      default_quota_days: 1,
    },
  });

  const mutation = useCreateTimeOffType();
  const isQuotaBased = useWatch({
    control: form.control,
    name: "is_quota_based",
  });

  const onSubmit = (data: CreateTimeOffType) => {
    mutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
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
        title="Tambah jenis cuti"
        maxWidth="sm"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-5">
          <FormField label="Nama">
            <Input
              label="Nama jenis cuti"
              type="text"
              {...form.register("name")}
              error={form.formState.errors.name?.message}
            />
          </FormField>

          <FormField label="Kategori">
            <Controller
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  label="Kategori"
                  options={[
                    { label: "Izin", value: "IZIN" },
                    { label: "Sakit", value: "SAKIT" },
                    { label: "Cuti", value: "CUTI" },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>

          <Controller
            name="is_quota_based"
            control={form.control}
            render={({ field }) => (
              <Switch
                checked={!!field.value}
                onChange={field.onChange}
                label="Berbasis kuota"
                description="Aktifkan jika jenis cuti ini memakai kuota tahunan"
              />
            )}
          />

          <FormField label="Kuota default">
            <Input
              label="Kuota default"
              type="number"
              min={0}
              disabled={!isQuotaBased}
              {...form.register("default_quota_days")}
              error={form.formState.errors.default_quota_days?.message}
            />
          </FormField>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
