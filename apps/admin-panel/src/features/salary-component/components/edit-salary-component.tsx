"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function EditSalaryComponent({
  component,
  isOpen,
  onClose,
}: Props) {
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Komponen Gaji</DialogTitle>
          <DialogDescription>
            Perbarui pengaturan komponen {component.name}.
          </DialogDescription>
        </DialogHeader>
        <form
          id="form-edit-salary-component"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-salary-component-code">Kode</Label>
            <Input
              id="edit-salary-component-code"
              value={component.code}
              disabled
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-salary-component-name">
              Nama <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-salary-component-name"
              {...form.register("name")}
              aria-invalid={!!form.formState.errors.name}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-salary-component-type">
              Tipe <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="edit-salary-component-type"
                      className="w-full"
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectValue placeholder="Pilih tipe komponen" />
                    </SelectTrigger>
                    <SelectContent>
                      {salaryComponentTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-salary-component-calculation">
              Metode Perhitungan <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="calculation_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="edit-salary-component-calculation"
                      className="w-full"
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectValue placeholder="Pilih metode perhitungan" />
                    </SelectTrigger>
                    <SelectContent>
                      {calculationTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-3 rounded-2xl border p-4">
            {(
              [
                ["is_taxable", "edit-salary-component-taxable", "Kena Pajak"],
                ["is_bpjs_base", "edit-salary-component-bpjs", "Dasar BPJS"],
                ["is_active", "edit-salary-component-active", "Aktif"],
              ] as const
            ).map(([name, id, label]) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={id}
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                    <Label htmlFor={id}>{label}</Label>
                  </div>
                )}
              />
            ))}
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="form-edit-salary-component"
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
