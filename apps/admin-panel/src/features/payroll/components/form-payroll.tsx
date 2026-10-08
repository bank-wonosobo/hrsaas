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
import { useZodForm } from "@/hooks/use-zod-form";
import { months } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useCreatePayroll } from "../hooks/use-create-payroll";
import { CreatePayroll, CreatePayrollSchema } from "../schemas/payroll-schema";

export function FormPayroll() {
  const [open, setOpen] = useState(false);

  const now = new Date();
  const form = useZodForm(CreatePayrollSchema, {
    defaultValues: {
      period_month: now.getMonth() + 1,
      period_year: now.getFullYear(),
    },
  });

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const { mutate, isPending } = useCreatePayroll(handleClose);

  const onSubmit = (data: CreatePayroll) => {
    mutate(data);
  };

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <PlusCircle />
        Buat Payroll
      </Button>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) handleClose();
          else setOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Payroll Baru</DialogTitle>
            <DialogDescription>
              Pilih periode untuk membuat payroll baru.
            </DialogDescription>
          </DialogHeader>
          <form
            id="form-payroll"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="period_month">
                Bulan <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="period_month"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger
                        id="period_month"
                        className="w-full"
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder="Pilih bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
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
              <Label htmlFor="period_year">
                Tahun <span className="text-destructive">*</span>
              </Label>
              <Input
                id="period_year"
                type="number"
                min={2000}
                max={2100}
                {...form.register("period_year", { valueAsNumber: true })}
                aria-invalid={!!form.formState.errors.period_year}
              />
              {form.formState.errors.period_year && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.period_year.message}
                </p>
              )}
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
              form="form-payroll"
              disabled={isPending}
            >
              {isPending ? "Membuat..." : "Buat Payroll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
