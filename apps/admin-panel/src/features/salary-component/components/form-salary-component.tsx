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
        type="button"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <PlusCircle />
        Tambah Komponen
      </Button>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) handleClose();
          else setOpen(true);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Tambah Komponen Gaji</DialogTitle>
            <DialogDescription>
              Lengkapi kode, jenis, dan aturan perhitungan komponen gaji.
            </DialogDescription>
          </DialogHeader>
          <form
            id="form-salary-component"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salary-component-code">
                  Kode <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="salary-component-code"
                  placeholder="Contoh: TRANSPORT"
                  {...form.register("code")}
                  aria-invalid={!!form.formState.errors.code}
                />
                {form.formState.errors.code && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.code.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary-component-name">
                  Nama <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="salary-component-name"
                  placeholder="Nama komponen"
                  {...form.register("name")}
                  aria-invalid={!!form.formState.errors.name}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary-component-type">
                Tipe <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="salary-component-type"
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
              <Label htmlFor="salary-component-calculation">
                Metode Perhitungan <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="calculation_type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="salary-component-calculation"
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
              <Controller
                name="is_taxable"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="salary-component-taxable"
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="salary-component-taxable">Kena Pajak</Label>
                      <p className="text-sm text-muted-foreground">
                        Komponen dihitung sebagai objek pajak.
                      </p>
                    </div>
                  </div>
                )}
              />
              <Controller
                name="is_bpjs_base"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="salary-component-bpjs"
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="salary-component-bpjs">Dasar BPJS</Label>
                      <p className="text-sm text-muted-foreground">
                        Komponen menjadi dasar perhitungan BPJS.
                      </p>
                    </div>
                  </div>
                )}
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="form-salary-component"
              disabled={isPending}
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
