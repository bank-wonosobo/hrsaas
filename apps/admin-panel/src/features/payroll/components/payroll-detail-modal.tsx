"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useZodForm } from "@/hooks/use-zod-form";
import { payrollAdjustmentTypeOptions } from "@/lib/data";
import { formatRupiah } from "@/lib/utils";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useCreatePayrollAdjustment } from "../hooks/use-create-payroll-adjustment";
import { useDeletePayrollAdjustment } from "../hooks/use-delete-payroll-adjustment";
import {
  CreatePayrollAdjustment,
  CreatePayrollAdjustmentSchema,
  PayrollDetail,
  PayrollItem,
} from "../schemas/payroll-schema";

interface Props {
  detail: PayrollDetail;
  payrollId: string;
  editable: boolean;
  isOpen: boolean;
  onClose: () => void;
}

function AdjustmentForm({
  payrollDetailId,
  payrollId,
}: {
  payrollDetailId: string;
  payrollId: string;
}) {
  const [open, setOpen] = useState(false);
  const form = useZodForm(CreatePayrollAdjustmentSchema, {
    defaultValues: { type: undefined, name: "", amount: 0, description: "" },
  });

  const { mutate, isPending } = useCreatePayrollAdjustment(payrollId, () => {
    form.reset();
    setOpen(false);
  });

  const onSubmit = (data: CreatePayrollAdjustment) => {
    mutate({ payrollDetailId, data });
  };

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <PlusCircle />
        Tambah Penyesuaian
      </Button>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="adjustment-type">
            Jenis <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="adjustment-type"
                    className="w-full"
                    aria-invalid={!!fieldState.error}
                  >
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    {payrollAdjustmentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <p className="text-sm text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adjustment-amount">
            Nominal (Rp) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="adjustment-amount"
            type="number"
            {...form.register("amount", { valueAsNumber: true })}
            aria-invalid={!!form.formState.errors.amount}
          />
          {form.formState.errors.amount && (
            <p className="text-sm text-destructive">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adjustment-name">
          Nama <span className="text-destructive">*</span>
        </Label>
        <Input
          id="adjustment-name"
          placeholder="Contoh: THR Idul Fitri 2026"
          {...form.register("name")}
          aria-invalid={!!form.formState.errors.name}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="adjustment-description">Keterangan</Label>
        <Input
          id="adjustment-description"
          placeholder="Keterangan (opsional)"
          {...form.register("description")}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            form.reset();
            setOpen(false);
          }}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}

function PayrollItemsTable({
  title,
  items,
  totalLabel,
  total,
  isDeduction = false,
}: {
  title: string;
  items: PayrollItem[];
  totalLabel: string;
  total: number;
  isDeduction?: boolean;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Komponen</TableHead>
              <TableHead className="text-right">Nilai Perhitungan</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  Tidak ada {title.toLowerCase()}.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {item.calculation_value ?? "-"}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium tabular-nums ${
                      isDeduction ? "text-destructive" : ""
                    }`}
                  >
                    {isDeduction ? "-" : ""}
                    {formatRupiah(item.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="text-right">
                {totalLabel}
              </TableCell>
              <TableCell
                className={`text-right tabular-nums ${
                  isDeduction ? "text-destructive" : "text-primary"
                }`}
              >
                {isDeduction ? "-" : ""}
                {formatRupiah(total)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </section>
  );
}

export default function PayrollDetailModal({
  detail,
  payrollId,
  editable,
  isOpen,
  onClose,
}: Props) {
  const { mutate: removeAdjustment } = useDeletePayrollAdjustment(payrollId);

  const items = detail.items ?? [];
  const allowanceItems = items.filter((item) => item.type === "EARNING");
  const deductionItems = items.filter((item) => item.type === "DEDUCTION");
  const totalAllowance = Math.max(detail.total_earning - detail.basic_salary, 0);

  const handleDeleteAdjustment = (id: string) => {
    if (!confirm("Yakin ingin menghapus penyesuaian ini?")) return;
    removeAdjustment(id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {detail.employee?.fullname ?? "Detail Payroll Pegawai"}
          </DialogTitle>
          <DialogDescription>
            Rincian komponen penghasilan, potongan, dan penyesuaian payroll.
            {detail.employee?.employee_number
              ? ` No. Pegawai ${detail.employee.employee_number}.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Gaji Pokok</p>
              <p className="mt-1 font-semibold tabular-nums">
                {formatRupiah(detail.basic_salary)}
              </p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Total Potongan</p>
              <p className="mt-1 font-semibold tabular-nums">
                {formatRupiah(detail.total_deduction)}
              </p>
            </div>
            <div className="rounded-2xl bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">Take Home Pay</p>
              <p className="mt-1 font-semibold tabular-nums text-primary">
                {formatRupiah(detail.net_salary)}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <PayrollItemsTable
              title="Allowance"
              items={allowanceItems}
              totalLabel="Total Allowance"
              total={totalAllowance}
            />
            <PayrollItemsTable
              title="Deduction"
              items={deductionItems}
              totalLabel="Total Deduction"
              total={detail.total_deduction}
              isDeduction
            />
          </div>

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">
                Penyesuaian (Bonus / THR / Koreksi)
              </h3>
              <p className="text-sm text-muted-foreground">
                Penyesuaian tambahan untuk payroll pegawai ini.
              </p>
            </div>
            <div className="rounded-2xl border px-4">
              {(detail.adjustments ?? []).length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Belum ada penyesuaian.
                </p>
              ) : (
                (detail.adjustments ?? []).map((adjustment) => (
                  <div
                    key={adjustment.id}
                    className="flex items-center justify-between gap-3 border-b py-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {adjustment.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {adjustment.type}
                        {adjustment.description
                          ? ` · ${adjustment.description}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`text-sm font-medium tabular-nums ${
                          adjustment.amount < 0 ? "text-destructive" : ""
                        }`}
                      >
                        {formatRupiah(adjustment.amount)}
                      </span>
                      {editable && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Hapus penyesuaian ${adjustment.name}`}
                          onClick={() => handleDeleteAdjustment(adjustment.id)}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {editable ? (
              <AdjustmentForm
                payrollDetailId={detail.id}
                payrollId={payrollId}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                Penyesuaian hanya bisa diubah saat payroll berstatus
                Draft/Terhitung.
              </p>
            )}
          </section>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
