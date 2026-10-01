"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const { data: timeOffTypes, isLoading: areTypesLoading, isError: typesError } = useGetAllTimeOffType();

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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Saldo Cuti</DialogTitle>
          <DialogDescription>Lengkapi informasi saldo cuti karyawan.</DialogDescription>
        </DialogHeader>
      <form
        id="form-time-off-balance"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="time_off_type_id">Jenis Cuti <span className="text-destructive">*</span></Label>
          <Controller
            name="time_off_type_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <Select value={field.value} onValueChange={field.onChange} disabled={areTypesLoading || !!typesError}>
                  <SelectTrigger id="time_off_type_id" className="w-full" aria-invalid={!!fieldState.error}>
                    <SelectValue placeholder={areTypesLoading ? "Memuat jenis cuti..." : "Pilih jenis cuti"} />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {typesError && <p className="text-sm text-destructive">Jenis cuti gagal dimuat.</p>}
                {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="period_year">Tahun Periode <span className="text-destructive">*</span></Label>
          <Input
            id="period_year"
            type="number"
            min={2000}
            {...form.register("period_year")}
            aria-invalid={!!form.formState.errors.period_year}
          />
          {form.formState.errors.period_year && <p className="text-sm text-destructive">{form.formState.errors.period_year.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="entitled_days">Hak Cuti (hari) <span className="text-destructive">*</span></Label>
            <Input
              id="entitled_days"
              type="number"
              min={0}
              {...form.register("entitled_days")}
              aria-invalid={!!form.formState.errors.entitled_days}
            />
            {form.formState.errors.entitled_days && <p className="text-sm text-destructive">{form.formState.errors.entitled_days.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="used_days">Terpakai (hari) <span className="text-destructive">*</span></Label>
            <Input
              id="used_days"
              type="number"
              min={0}
              {...form.register("used_days")}
              aria-invalid={!!form.formState.errors.used_days}
            />
            {form.formState.errors.used_days && <p className="text-sm text-destructive">{form.formState.errors.used_days.message}</p>}
          </div>
        </div>
      </form>
      <DialogFooter>
        <Button variant="outline" onClick={handleClose} disabled={isPending}>Batal</Button>
        <Button type="submit" form="form-time-off-balance" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
