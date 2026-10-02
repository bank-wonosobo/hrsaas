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
import { useUpdateEmployeeSalary } from "../hooks/use-update-employee-salary";
import {
  EmployeeSalary,
  UpdateEmployeeSalary,
  UpdateEmployeeSalarySchema,
} from "../schemas/employee-salary-schema";

interface Props {
  salary: EmployeeSalary;
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

export default function EditEmployeeSalary({ salary, isOpen, onClose }: Props) {
  const form = useZodForm(UpdateEmployeeSalarySchema, {
    values: {
      basic_salary: salary.basic_salary,
      effective_date: new Date(salary.effective_date).toISOString(),
      end_date: salary.end_date ? new Date(salary.end_date).toISOString() : "",
    },
  });

  const { mutate, isPending } = useUpdateEmployeeSalary(onClose);
  const salaryError = form.formState.errors.basic_salary?.message;
  const effectiveDateError = form.formState.errors.effective_date?.message;
  const endDateError = form.formState.errors.end_date?.message;

  const onSubmit = (data: UpdateEmployeeSalary) => {
    mutate({
      id: salary.id,
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
          <DialogTitle>Edit Gaji Pokok</DialogTitle>
        </DialogHeader>
        <form
          id="form-edit-employee-salary"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-employee-salary-basic">Gaji Pokok (Rp) <span className="text-destructive">*</span></Label>
            <Input
              id="edit-employee-salary-basic"
              type="number"
              min={0}
              aria-invalid={!!salaryError}
              {...form.register("basic_salary")}
            />
            {salaryError && <p className="text-sm text-destructive">{salaryError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-employee-salary-effective">Berlaku Sejak <span className="text-destructive">*</span></Label>
            <Controller
              name="effective_date"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="edit-employee-salary-effective"
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
            <Label htmlFor="edit-employee-salary-end">Berlaku Sampai</Label>
            <Controller
              name="end_date"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="edit-employee-salary-end"
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
          <Button type="submit" form="form-edit-employee-salary" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
