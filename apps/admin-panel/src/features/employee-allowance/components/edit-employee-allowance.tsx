"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useZodForm } from "@/hooks/use-zod-form";
import { Controller } from "react-hook-form";
import { useUpdateEmployeeAllowance } from "../hooks/use-update-employee-allowance";
import {
  EmployeeAllowance,
  UpdateEmployeeAllowance,
  UpdateEmployeeAllowanceSchema,
} from "../schemas/employee-allowance-schema";

interface Props {
  allowance: EmployeeAllowance;
  isOpen: boolean;
  onClose: () => void;
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function toDateISOString(value: string) {
  return value
    ? new Date(`${value.slice(0, 10)}T00:00:00.000Z`).toISOString()
    : "";
}

export default function EditEmployeeAllowance({ allowance, isOpen, onClose }: Props) {
  const form = useZodForm(UpdateEmployeeAllowanceSchema, {
    values: {
      amount: allowance.amount,
      percentage: allowance.percentage,
      effective_date: new Date(allowance.effective_date).toISOString(),
      end_date: allowance.end_date ? new Date(allowance.end_date).toISOString() : "",
    },
  });
  const { mutate, isPending } = useUpdateEmployeeAllowance(onClose);
  const amountError = form.formState.errors.amount?.message;
  const percentageError = form.formState.errors.percentage?.message;
  const effectiveDateError = form.formState.errors.effective_date?.message;
  const endDateError = form.formState.errors.end_date?.message;

  const onSubmit = (data: UpdateEmployeeAllowance) => {
    mutate({
      id: allowance.id,
      data: {
        ...data,
        effective_date: data.effective_date
          ? toDateISOString(data.effective_date)
          : undefined,
        end_date: data.end_date ? toDateISOString(data.end_date) : undefined,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Tunjangan
            {allowance.salary_component
              ? ` — ${allowance.salary_component.name}`
              : ""}
          </DialogTitle>
        </DialogHeader>
        <form
          id="form-edit-employee-allowance"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-employee-allowance-amount">Nominal (Rp)</Label>
              <Input
                id="edit-employee-allowance-amount"
                type="number"
                min={0}
                aria-invalid={!!amountError}
                {...form.register("amount")}
              />
              <p className="text-sm text-muted-foreground">Isi salah satu: nominal atau %.</p>
              {amountError && <p className="text-sm text-destructive">{amountError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-employee-allowance-percentage">Persentase (%)</Label>
              <Input
                id="edit-employee-allowance-percentage"
                type="number"
                min={0}
                max={100}
                aria-invalid={!!percentageError}
                {...form.register("percentage")}
              />
              <p className="text-sm text-muted-foreground">Dari gaji pokok.</p>
              {percentageError && <p className="text-sm text-destructive">{percentageError}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-employee-allowance-effective">Berlaku Sejak <span className="text-destructive">*</span></Label>
            <Controller
              name="effective_date"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="edit-employee-allowance-effective"
                  type="date"
                  value={toDateInputValue(field.value)}
                  onChange={(event) => field.onChange(toDateISOString(event.target.value))}
                  aria-invalid={!!effectiveDateError}
                />
              )}
            />
            {effectiveDateError && <p className="text-sm text-destructive">{effectiveDateError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-employee-allowance-end">Berlaku Sampai</Label>
            <Controller
              name="end_date"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="edit-employee-allowance-end"
                  type="date"
                  value={toDateInputValue(field.value)}
                  onChange={(event) => field.onChange(toDateISOString(event.target.value))}
                  aria-invalid={!!endDateError}
                />
              )}
            />
            <p className="text-sm text-muted-foreground">Kosongkan jika masih berlaku.</p>
            {endDateError && <p className="text-sm text-destructive">{endDateError}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-edit-employee-allowance" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
