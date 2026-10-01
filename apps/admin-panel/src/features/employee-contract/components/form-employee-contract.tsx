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
import { useSearchDivision } from "@/features/division/hooks/use-search-division";
import { useSearchPosition } from "@/features/position/hooks/use-search-position";
import { useZodForm } from "@/hooks/use-zod-form";
import { contractType } from "@/lib/data";
import { mapToOptions } from "@/lib/utils";
import { Controller } from "react-hook-form";
import { useCreateEmployeeContract } from "../hooks/use-create-employee-contract";
import {
  CreateEmployeeContract,
  CreateEmployeeContractSchema,
  EMPLOYEE_STATUS_OPTIONS,
} from "../schemas/employee-contract-schema";

interface Props {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
}

const toISOStringFromDateInput = (value: string) =>
  new Date(`${value}T00:00:00`).toISOString();

export default function FormEmployeeContract({
  employeeId,
  isOpen,
  onClose,
}: Props) {
  const form = useZodForm(CreateEmployeeContractSchema, {
    defaultValues: {
      employee_id: employeeId,
      contract_type: "",
      start_date: "",
      end_date: "",
      division_id: "",
      position_id: "",
      salary: 0,
      employee_status: undefined,
    },
  });

  const {
    data: divisionData,
    isLoading: isDivisionLoading,
    isError: isDivisionError,
  } = useSearchDivision({ page: 1, size: 100 });
  const {
    data: positionData,
    isLoading: isPositionLoading,
    isError: isPositionError,
  } = useSearchPosition({ page: 1, size: 100 });

  const divisionOptions = mapToOptions(
    divisionData?.data ?? [],
    (division) => division.name,
    (division) => division.id,
  );
  const positionOptions = mapToOptions(
    positionData?.data ?? [],
    (position) => position.name,
    (position) => position.id,
  );

  const resetAndClose = () => {
    form.reset();
    onClose();
  };

  const { mutate, isPending } = useCreateEmployeeContract(resetAndClose);

  const onSubmit = (data: CreateEmployeeContract) => {
    mutate({
      ...data,
      employee_id: employeeId,
      start_date: toISOStringFromDateInput(data.start_date),
      end_date: data.end_date
        ? toISOStringFromDateInput(data.end_date)
        : undefined,
    });
  };

  const closeDialog = (open: boolean) => {
    if (!open && !isPending) resetAndClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Kontrak Karyawan</DialogTitle>
        </DialogHeader>
        <form
          id="form-employee-contract"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="contract-type">
              Jenis Kontrak <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="contract_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="contract-type"
                      className="w-full"
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectValue placeholder="Pilih jenis kontrak" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractType.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-xs text-destructive" role="alert">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-start-date">
                Tanggal Mulai <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="start_date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      id="contract-start-date"
                      type="date"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      aria-invalid={!!fieldState.error}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-destructive" role="alert">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-end-date">Tanggal Berakhir</Label>
              <Controller
                name="end_date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      id="contract-end-date"
                      type="date"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      aria-invalid={!!fieldState.error}
                    />
                    <p className="text-xs text-muted-foreground">
                      Kosongkan jika kontrak tetap.
                    </p>
                    {fieldState.error && (
                      <p className="text-xs text-destructive" role="alert">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-division">
              Divisi <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="division_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="contract-division"
                      className="w-full"
                      aria-invalid={!!fieldState.error}
                      disabled={isDivisionLoading || isDivisionError}
                    >
                      <SelectValue
                        placeholder={
                          isDivisionLoading
                            ? "Memuat divisi..."
                            : isDivisionError
                              ? "Gagal memuat divisi"
                              : "Pilih divisi"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {divisionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-xs text-destructive" role="alert">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-position">
              Jabatan <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="position_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="contract-position"
                      className="w-full"
                      aria-invalid={!!fieldState.error}
                      disabled={isPositionLoading || isPositionError}
                    >
                      <SelectValue
                        placeholder={
                          isPositionLoading
                            ? "Memuat jabatan..."
                            : isPositionError
                              ? "Gagal memuat jabatan"
                              : "Pilih jabatan"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-xs text-destructive" role="alert">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-salary">
              Gaji (Rp) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contract-salary"
              type="number"
              min={0}
              {...form.register("salary")}
              aria-invalid={!!form.formState.errors.salary}
            />
            {form.formState.errors.salary && (
              <p className="text-xs text-destructive" role="alert">
                {form.formState.errors.salary.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-employee-status">Status Karyawan</Label>
            <Controller
              name="employee_status"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? undefined : value)
                    }
                  >
                    <SelectTrigger
                      id="contract-employee-status"
                      className="w-full"
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectValue placeholder="Pilih status karyawan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ditentukan</SelectItem>
                      {EMPLOYEE_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-xs text-destructive" role="alert">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={resetAndClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="form-employee-contract"
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
