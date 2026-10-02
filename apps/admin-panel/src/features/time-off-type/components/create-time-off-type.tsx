"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Switch from "@/components/ui/switch/switch";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useCreateTimeOffType } from "../hooks/use-create-time-off-type";
import {
  CreateTimeOffTypeSchema,
  type CreateTimeOffType,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <PlusCircle />
          Tambah
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah jenis cuti</DialogTitle>
        </DialogHeader>
        <form
          id="create-time-off-type"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <Field>
            <FieldLabel htmlFor="time-off-type-name">Nama</FieldLabel>
            <Input
              id="time-off-type-name"
              placeholder="Nama jenis cuti"
              aria-invalid={!!form.formState.errors.name}
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="time-off-type-category">Kategori</FieldLabel>
            <Controller
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="time-off-type-category"
                      className="w-full"
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IZIN">Izin</SelectItem>
                      <SelectItem value="SAKIT">Sakit</SelectItem>
                      <SelectItem value="CUTI">Cuti</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </>
              )}
            />
          </Field>

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

          <Field>
            <FieldLabel htmlFor="time-off-type-quota">Kuota default</FieldLabel>
            <Input
              id="time-off-type-quota"
              type="number"
              min={0}
              disabled={!isQuotaBased}
              aria-invalid={!!form.formState.errors.default_quota_days}
              {...form.register("default_quota_days")}
            />
            <FieldError>
              {form.formState.errors.default_quota_days?.message}
            </FieldError>
          </Field>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="create-time-off-type"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
