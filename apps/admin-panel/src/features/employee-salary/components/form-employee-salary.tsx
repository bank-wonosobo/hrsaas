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
import { useCreateEmployeeSalary } from "../hooks/use-create-employee-salary";
import {
  CreateEmployeeSalary,
  CreateEmployeeSalarySchema,
} from "../schemas/employee-salary-schema";

interface Props {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export default function FormEmployeeSalary({ employeeId, isOpen, onClose }: Props) {
  const form = useZodForm(CreateEmployeeSalarySchema, {
    defaultValues: {
      employee_id: employeeId,
      basic_salary: 0,
      effective_date: "",
      end_date: "",
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const { mutate, isPending } = useCreateEmployeeSalary(handleClose);

  const onSubmit = (data: CreateEmployeeSalary) => {
    mutate({
      ...data,
      employee_id: employeeId,
      effective_date: new Date(`${data.effective_date.slice(0, 10)}T00:00:00.000Z`).toISOString(),
      end_date: data.end_date
        ? new Date(`${data.end_date.slice(0, 10)}T00:00:00.000Z`).toISOString()
        : undefined,
    });
  };

  const effectiveDateError = form.formState.errors.effective_date?.message;
  const endDateError = form.formState.errors.end_date?.message;
  const salaryError = form.formState.errors.basic_salary?.message;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Gaji Pokok</DialogTitle>
        </DialogHeader>
        <form
          id="form-employee-salary"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="employee-salary-basic">Gaji Pokok (Rp) <span className="text-destructive">*</span></Label>
            <Input
              id="employee-salary-basic"
              type="number"
              min={0}
              aria-invalid={!!salaryError}
              {...form.register("basic_salary")}
            />
            {salaryError && <p className="text-sm text-destructive">{salaryError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee-salary-effective">Berlaku Sejak <span className="text-destructive">*</span></Label>
            <Controller
              name="effective_date"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="employee-salary-effective"
                  type="date"
                  value={toDateInputValue(field.value)}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        ? new Date(`${event.target.value}T00:00:00.000Z`).toISOString()
                        : "",
                    )
                  }
                  aria-invalid={!!effectiveDateError}
                />
              )}
            />
            {effectiveDateError && <p className="text-sm text-destructive">{effectiveDateError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee-salary-end">Berlaku Sampai</Label>
            <Controller
              name="end_date"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="employee-salary-end"
                  type="date"
                  value={toDateInputValue(field.value)}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        ? new Date(`${event.target.value}T00:00:00.000Z`).toISOString()
                        : "",
                    )
                  }
                  aria-invalid={!!endDateError}
                />
              )}
            />
            <p className="text-sm text-muted-foreground">Kosongkan jika masih berlaku.</p>
            {endDateError && <p className="text-sm text-destructive">{endDateError}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-employee-salary" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
