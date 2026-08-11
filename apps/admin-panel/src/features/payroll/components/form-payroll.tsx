"use client";
import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
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
        variant="secondary"
        onClick={() => setOpen(true)}
        prefixIcon={<PlusCircle size={18} />}
      >
        Buat Payroll
      </Button>

      <Modal
        isOpen={open}
        onClose={handleClose}
        title="Buat Payroll Baru"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" onClick={handleClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" form="form-payroll" loading={isPending}>
              Buat
            </Button>
          </>
        }
      >
        <form
          id="form-payroll"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField label="Bulan" required>
            <Controller
              name="period_month"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  label="Bulan"
                  options={months}
                  value={field.value?.toString()}
                  onChange={(v) => field.onChange(Number(v))}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Tahun" required>
            <Input
              label="Tahun"
              type="number"
              {...form.register("period_year")}
              error={form.formState.errors.period_year?.message}
            />
          </FormField>
        </form>
      </Modal>
    </>
  );
}
