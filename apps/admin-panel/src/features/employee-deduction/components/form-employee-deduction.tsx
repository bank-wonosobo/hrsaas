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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchSalaryComponent } from "@/features/salary-component/hooks/use-search-salary-component";
import { useZodForm } from "@/hooks/use-zod-form";
import { Controller } from "react-hook-form";
import { useCreateEmployeeDeduction } from "../hooks/use-create-employee-deduction";
import {
  CreateEmployeeDeduction,
  CreateEmployeeDeductionSchema,
} from "../schemas/employee-deduction-schema";

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

function toDateISOString(value: string) {
  return value
    ? new Date(`${value.slice(0, 10)}T00:00:00.000Z`).toISOString()
    : "";
}

export default function FormEmployeeDeduction({
  employeeId,
  isOpen,
  onClose,
}: Props) {
  const form = useZodForm(CreateEmployeeDeductionSchema, {
    defaultValues: {
      employee_id: employeeId,
      salary_component_id: "",
      amount: 0,
      percentage: 0,
      effective_date: "",
      end_date: "",
    },
  });
  const {
    data: componentData,
    isLoading: isLoadingComponents,
    isError: isComponentError,
  } = useSearchSalaryComponent({
    type: "DEDUCTION",
    active_only: true,
    page: 1,
    size: 100,
  });
  const components = componentData?.data ?? [];
  const handleClose = () => {
    form.reset();
    onClose();
  };
  const { mutate, isPending } = useCreateEmployeeDeduction(handleClose);

  const onSubmit = (data: CreateEmployeeDeduction) => {
    mutate({
      ...data,
      employee_id: employeeId,
      effective_date: toDateISOString(data.effective_date),
      end_date: data.end_date ? toDateISOString(data.end_date) : undefined,
    });
  };

  const componentError = form.formState.errors.salary_component_id?.message;
  const amountError = form.formState.errors.amount?.message;
  const percentageError = form.formState.errors.percentage?.message;
  const effectiveDateError = form.formState.errors.effective_date?.message;
  const endDateError = form.formState.errors.end_date?.message;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Potongan</DialogTitle>
        </DialogHeader>
        <form
          id="form-employee-deduction"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="employee-deduction-component">Komponen Potongan <span className="text-destructive">*</span></Label>
            <Controller
              name="salary_component_id"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoadingComponents || isComponentError || components.length === 0}
                >
                  <SelectTrigger
                    id="employee-deduction-component"
                    className="w-full"
                    aria-invalid={!!componentError}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingComponents
                          ? "Memuat komponen..."
                          : components.length === 0
                            ? "Komponen tidak tersedia"
                            : "Pilih komponen"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((component) => (
                      <SelectItem key={component.id} value={component.id}>
                        {component.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {isComponentError && (
              <p role="alert" className="text-sm text-destructive">
                Komponen potongan gagal dimuat.
              </p>
            )}
            {componentError && <p className="text-sm text-destructive">{componentError}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employee-deduction-amount">Nominal (Rp)</Label>
              <Input
                id="employee-deduction-amount"
                type="number"
                min={0}
                aria-invalid={!!amountError}
                {...form.register("amount")}
              />
              <p className="text-sm text-muted-foreground">Isi salah satu: nominal atau %.</p>
              {amountError && <p className="text-sm text-destructive">{amountError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-deduction-percentage">Persentase (%)</Label>
              <Input
                id="employee-deduction-percentage"
                type="number"
                step="any"
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
            <Label htmlFor="employee-deduction-effective">Berlaku Sejak <span className="text-destructive">*</span></Label>
            <Controller
              name="effective_date"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="employee-deduction-effective"
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
            <Label htmlFor="employee-deduction-end">Berlaku Sampai</Label>
            <Controller
              name="end_date"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="employee-deduction-end"
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
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-employee-deduction" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
