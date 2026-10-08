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
import { useEffect } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useCreateEmployeeAllowance } from "../hooks/use-create-employee-allowance";
import {
  CreateEmployeeAllowance,
  CreateEmployeeAllowanceSchema,
} from "../schemas/employee-allowance-schema";
interface Props {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
}
const CALCULATION_TYPE = {
  FIXED: "FIXED",
  SALARY_PERCENTAGE: "SALARY_PERCENTAGE",
  ATTENDANCE: "ATTENDANCE",
  GROSS_PERCENTAGE: "GROSS_PERCENTAGE",
} as const;
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
function getCalculationDescription(calculationType?: string) {
  switch (calculationType) {
    case CALCULATION_TYPE.FIXED:
      return "Nominal tunjangan ditentukan dalam jumlah tetap.";
    case CALCULATION_TYPE.ATTENDANCE:
      return "Nominal tunjangan dihitung berdasarkan kehadiran karyawan.";
    case CALCULATION_TYPE.SALARY_PERCENTAGE:
      return "Tunjangan dihitung berdasarkan persentase dari gaji pokok.";
    case CALCULATION_TYPE.GROSS_PERCENTAGE:
      return "Tunjangan dihitung berdasarkan persentase dari total pendapatan (gross).";
    default:
      return "Pilih komponen tunjangan untuk menentukan metode perhitungan.";
  }
}
export default function FormEmployeeAllowance({
  employeeId,
  isOpen,
  onClose,
}: Props) {
  const form = useZodForm(CreateEmployeeAllowanceSchema, {
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
    type: "EARNING",
    active_only: true,
    page: 1,
    size: 100,
  });
  const components = componentData?.data ?? [];
  const salaryComponentId = useWatch({
    control: form.control,
    name: "salary_component_id",
  });
  const selectedComponent = components.find(
    (component) => component.id === salaryComponentId,
  );
  const calculationType = selectedComponent?.calculation_type;
  const isFixed = calculationType === CALCULATION_TYPE.FIXED;
  const isAttendance = calculationType === CALCULATION_TYPE.ATTENDANCE;
  const isSalaryPercentage =
    calculationType === CALCULATION_TYPE.SALARY_PERCENTAGE;
  const isGrossPercentage =
    calculationType === CALCULATION_TYPE.GROSS_PERCENTAGE;
  const isAmountDisabled =
    !selectedComponent || isSalaryPercentage || isGrossPercentage;
  const isPercentageDisabled = !selectedComponent || isFixed || isAttendance;
  /** * Reset field yang tidak digunakan berdasarkan * metode perhitungan komponen. */
  useEffect(() => {
    if (!selectedComponent) {
      form.setValue("amount", 0);
      form.setValue("percentage", 0);
      return;
    }
    switch (selectedComponent.calculation_type) {
      case CALCULATION_TYPE.FIXED:
      case CALCULATION_TYPE.ATTENDANCE:
        form.setValue("percentage", 0);
        break;
      case CALCULATION_TYPE.SALARY_PERCENTAGE:
      case CALCULATION_TYPE.GROSS_PERCENTAGE:
        form.setValue("amount", 0);
        break;
      default:
        form.setValue("amount", 0);
        form.setValue("percentage", 0);
        break;
    }
  }, [selectedComponent, form]);
  const handleClose = () => {
    form.reset({
      employee_id: employeeId,
      salary_component_id: "",
      amount: 0,
      percentage: 0,
      effective_date: "",
      end_date: "",
    });
    onClose();
  };
  const { mutate, isPending } = useCreateEmployeeAllowance(handleClose);
  const onSubmit = (data: CreateEmployeeAllowance) => {
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
      {" "}
      <DialogContent>
        {" "}
        <DialogHeader>
          {" "}
          <DialogTitle> Tambah Tunjangan </DialogTitle>{" "}
        </DialogHeader>{" "}
        <form
          id="form-employee-allowance"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {" "}
          {/* COMPONENT */}{" "}
          <div className="space-y-2">
            {" "}
            <Label htmlFor="employee-allowance-component">
              {" "}
              Komponen Tunjangan{" "}
              <span className="text-destructive"> * </span>{" "}
            </Label>{" "}
            <Controller
              name="salary_component_id"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={
                    isLoadingComponents ||
                    isComponentError ||
                    components.length === 0
                  }
                >
                  {" "}
                  <SelectTrigger
                    id="employee-allowance-component"
                    className="w-full"
                    aria-invalid={!!componentError}
                  >
                    {" "}
                    <SelectValue
                      placeholder={
                        isLoadingComponents
                          ? "Memuat komponen..."
                          : components.length === 0
                            ? "Komponen tidak tersedia"
                            : "Pilih komponen"
                      }
                    />{" "}
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {" "}
                    {components.map((component) => (
                      <SelectItem key={component.id} value={component.id}>
                        {" "}
                        {component.name}{" "}
                      </SelectItem>
                    ))}{" "}
                  </SelectContent>{" "}
                </Select>
              )}
            />{" "}
            {isComponentError && (
              <p role="alert" className="text-sm text-destructive">
                {" "}
                Komponen tunjangan gagal dimuat.{" "}
              </p>
            )}{" "}
            {componentError && (
              <p className="text-sm text-destructive"> {componentError} </p>
            )}{" "}
            {/* CALCULATION TYPE DESCRIPTION */}{" "}
            <div className="rounded-md px-3 py-2 bg-primary/20">
              {" "}
              <p className="text-sm font-medium"> Metode Perhitungan </p>{" "}
              <p className="text-sm text-muted-foreground">
                {" "}
                {getCalculationDescription(calculationType)}{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          {/* AMOUNT & PERCENTAGE */}{" "}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {" "}
            {/* AMOUNT */}{" "}
            <div className="space-y-2">
              {" "}
              <Label htmlFor="employee-allowance-amount">
                {" "}
                Nominal (Rp){" "}
              </Label>{" "}
              <Input
                id="employee-allowance-amount"
                type="number"
                min={0}
                disabled={isAmountDisabled}
                aria-invalid={!!amountError}
                {...form.register("amount", { valueAsNumber: true })}
              />{" "}
              <p className="text-sm text-muted-foreground">
                {" "}
                {isFixed && "Masukkan nominal tunjangan tetap."}{" "}
                {isAttendance &&
                  "Masukkan nominal tunjangan per hari kehadiran."}{" "}
                {isSalaryPercentage &&
                  "Tidak digunakan karena tunjangan dihitung dari persentase gaji pokok."}{" "}
                {isGrossPercentage &&
                  "Tidak digunakan karena tunjangan dihitung dari persentase total pendapatan."}{" "}
                {!selectedComponent &&
                  "Pilih komponen tunjangan terlebih dahulu."}{" "}
              </p>{" "}
              {amountError && (
                <p className="text-sm text-destructive"> {amountError} </p>
              )}{" "}
            </div>{" "}
            {/* PERCENTAGE */}{" "}
            <div className="space-y-2">
              {" "}
              <Label htmlFor="employee-allowance-percentage">
                {" "}
                Persentase (%){" "}
              </Label>{" "}
              <Input
                id="employee-allowance-percentage"
                type="number"
                min={0}
                max={100}
                disabled={isPercentageDisabled}
                aria-invalid={!!percentageError}
                {...form.register("percentage", { valueAsNumber: true })}
              />{" "}
              <p className="text-sm text-muted-foreground">
                {" "}
                {isSalaryPercentage && "Persentase dari gaji pokok."}{" "}
                {isGrossPercentage &&
                  "Persentase dari total pendapatan (gross)."}{" "}
                {isFixed && "Tidak digunakan untuk komponen nominal tetap."}{" "}
                {isAttendance &&
                  "Tidak digunakan untuk komponen berbasis kehadiran."}{" "}
                {!selectedComponent &&
                  "Pilih komponen tunjangan terlebih dahulu."}{" "}
              </p>{" "}
              {percentageError && (
                <p className="text-sm text-destructive"> {percentageError} </p>
              )}{" "}
            </div>{" "}
          </div>{" "}
          {/* EFFECTIVE DATE */}{" "}
          <div className="space-y-2">
            {" "}
            <Label htmlFor="employee-allowance-effective">
              {" "}
              Berlaku Sejak <span className="text-destructive"> * </span>{" "}
            </Label>{" "}
            <Controller
              name="effective_date"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="employee-allowance-effective"
                  type="date"
                  value={toDateInputValue(field.value)}
                  onChange={(event) =>
                    field.onChange(toDateISOString(event.target.value))
                  }
                  aria-invalid={!!effectiveDateError}
                />
              )}
            />{" "}
            {effectiveDateError && (
              <p className="text-sm text-destructive"> {effectiveDateError} </p>
            )}{" "}
          </div>{" "}
          {/* END DATE */}{" "}
          <div className="space-y-2">
            {" "}
            <Label htmlFor="employee-allowance-end">
              {" "}
              Berlaku Sampai{" "}
            </Label>{" "}
            <Controller
              name="end_date"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="employee-allowance-end"
                  type="date"
                  value={toDateInputValue(field.value)}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        ? toDateISOString(event.target.value)
                        : "",
                    )
                  }
                  aria-invalid={!!endDateError}
                />
              )}
            />{" "}
            <p className="text-sm text-muted-foreground">
              {" "}
              Kosongkan jika masih berlaku.{" "}
            </p>{" "}
            {endDateError && (
              <p className="text-sm text-destructive"> {endDateError} </p>
            )}{" "}
          </div>{" "}
        </form>{" "}
        <DialogFooter>
          {" "}
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            {" "}
            Batal{" "}
          </Button>{" "}
          <Button
            type="submit"
            form="form-employee-allowance"
            disabled={isPending}
          >
            {" "}
            {isPending ? "Menyimpan..." : "Simpan"}{" "}
          </Button>{" "}
        </DialogFooter>{" "}
      </DialogContent>{" "}
    </Dialog>
  );
}
