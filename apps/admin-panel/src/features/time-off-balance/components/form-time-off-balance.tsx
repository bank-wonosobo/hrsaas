"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
import { useGetAllTimeOffType } from "@/features/time-off-type/hooks/use-getall-time-off-type";
import { useZodForm } from "@/hooks/use-zod-form";
import { mapToOptions } from "@/lib/utils";
import { Controller } from "react-hook-form";
import { useCreateTimeOffBalance } from "../hooks/use-create-time-off-balance";
import {
  CreateTimeOffBalance,
  CreateTimeOffBalanceSchema,
} from "../schemas/time-off-balance-schema";

interface Props {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FormTimeOffBalance({ employeeId, isOpen, onClose }: Props) {
  const currentYear = new Date().getFullYear();

  const form = useZodForm(CreateTimeOffBalanceSchema, {
    defaultValues: {
      employee_id: employeeId,
      time_off_type_id: "",
      period_year: currentYear,
      entitled_days: 0,
      used_days: 0,
    },
  });

  const { data: timeOffTypes } = useGetAllTimeOffType();

  const typeOptions = mapToOptions(
    timeOffTypes ?? [],
    (t) => t.name,
    (t) => t.id,
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const { mutate, isPending } = useCreateTimeOffBalance(handleClose);

  const onSubmit = (data: CreateTimeOffBalance) => {
    mutate({ ...data, employee_id: employeeId });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Saldo Cuti"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            type="submit"
            form="form-time-off-balance"
            loading={isPending}
          >
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="form-time-off-balance"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField label="Jenis Cuti" required>
          <Controller
            name="time_off_type_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Jenis Cuti"
                options={typeOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>

        <FormField label="Tahun Periode" required>
          <Input
            label="Tahun Periode"
            type="number"
            min={2000}
            {...form.register("period_year")}
            error={form.formState.errors.period_year?.message}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Hak Cuti (hari)" required>
            <Input
              label="Hak Cuti"
              type="number"
              min={0}
              {...form.register("entitled_days")}
              error={form.formState.errors.entitled_days?.message}
            />
          </FormField>

          <FormField label="Terpakai (hari)" required>
            <Input
              label="Terpakai"
              type="number"
              min={0}
              {...form.register("used_days")}
              error={form.formState.errors.used_days?.message}
            />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
