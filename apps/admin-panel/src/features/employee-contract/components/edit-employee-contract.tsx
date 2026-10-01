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
import { useUpdateEmployeeContract } from "../hooks/use-update-employee-contract";
import {
  EMPLOYEE_STATUS_OPTIONS,
  EmployeeContract,
  UpdateEmployeeContract,
  UpdateEmployeeContractSchema,
} from "../schemas/employee-contract-schema";

interface Props {
  contract: EmployeeContract;
  isOpen: boolean;
  onClose: () => void;
}

const toDateInputValue = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toISOStringFromDateInput = (value: string) =>
  new Date(`${value}T00:00:00`).toISOString();

export default function EditEmployeeContract({
  contract,
  isOpen,
  onClose,
}: Props) {
  const form = useZodForm(UpdateEmployeeContractSchema, {
    values: {
      contract_type: contract.contract_type,
      start_date: toDateInputValue(contract.start_date),
      end_date: contract.end_date
        ? toDateInputValue(contract.end_date)
        : "",
      division_id: contract.division_id,
      position_id: contract.position_id,
      salary: contract.salary,
      employee_status: contract.employee_status ?? undefined,
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

  const { mutate, isPending } = useUpdateEmployeeContract(onClose);

  const onSubmit = (data: UpdateEmployeeContract) => {
    mutate({
      id: contract.id,
      data: {
        ...data,
        start_date: toISOStringFromDateInput(data.start_date),
        end_date: data.end_date
          ? toISOStringFromDateInput(data.end_date)
          : undefined,
      },
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Kontrak Karyawan</DialogTitle>
        </DialogHeader>
        <form
          id="form-edit-employee-contract"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-contract-type">
              Jenis Kontrak <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="contract_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="edit-contract-type"
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
              <Label htmlFor="edit-contract-start-date">
                Tanggal Mulai <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="start_date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      id="edit-contract-start-date"
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
              <Label htmlFor="edit-contract-end-date">Tanggal Berakhir</Label>
              <Controller
                name="end_date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Input
                      id="edit-contract-end-date"
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
            <Label htmlFor="edit-contract-division">
              Divisi <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="division_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="edit-contract-division"
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
            <Label htmlFor="edit-contract-position">
              Jabatan <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="position_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="edit-contract-position"
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
            <Label htmlFor="edit-contract-salary">
              Gaji (Rp) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-contract-salary"
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
            <Label htmlFor="edit-contract-employee-status">
              Status Karyawan
            </Label>
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
                      id="edit-contract-employee-status"
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
            onClick={onClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="form-edit-employee-contract"
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
