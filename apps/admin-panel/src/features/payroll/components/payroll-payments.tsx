"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useZodForm } from "@/hooks/use-zod-form";
import { paymentStatusOptions } from "@/lib/data";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useSearchPayrollPayments } from "../hooks/use-search-payroll-payments";
import { useUpdatePaymentStatus } from "../hooks/use-update-payment-status";
import {
  PayrollPayment,
  UpdatePayrollPaymentStatus,
  UpdatePayrollPaymentStatusSchema,
} from "../schemas/payroll-schema";

const statusConfig: Record<
  string,
  { label: string; variant: "outline" | "secondary" | "destructive"; className?: string }
> = {
  PENDING: { label: "Menunggu", variant: "outline" },
  PROCESSING: {
    label: "Diproses",
    variant: "secondary",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  SUCCESS: {
    label: "Berhasil",
    variant: "secondary",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  FAILED: { label: "Gagal", variant: "destructive" },
};

function UpdateStatusModal({
  payment,
  onClose,
}: {
  payment: PayrollPayment;
  onClose: () => void;
}) {
  const form = useZodForm(UpdatePayrollPaymentStatusSchema, {
    defaultValues: { status: payment.status, payment_reference: payment.payment_reference ?? "" },
  });

  const { mutate, isPending } = useUpdatePaymentStatus(onClose);

  const onSubmit = (data: UpdatePayrollPaymentStatus) => {
    mutate({ id: payment.id, data });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Status Pembayaran</DialogTitle>
          <DialogDescription>
            {payment.account_name ?? "Perbarui status dan referensi pembayaran."}
          </DialogDescription>
        </DialogHeader>
      <form
        id="form-update-payment-status"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="payment-status">
            Status <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="payment-status"
                    className="w-full"
                    aria-invalid={!!fieldState.error}
                  >
                    <SelectValue placeholder="Pilih status pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatusOptions.map((option) => (
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
          <Label htmlFor="payment-reference">Referensi Pembayaran</Label>
          <Input
            id="payment-reference"
            placeholder="Nomor referensi dari bank (opsional)"
            {...form.register("payment_reference")}
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
            form="form-update-payment-status"
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PayrollPayments({ payrollId }: { payrollId: string }) {
  const [selected, setSelected] = useState<PayrollPayment | null>(null);
  const { data, isLoading } = useSearchPayrollPayments({
    payroll_id: payrollId,
    page: 1,
    size: 100,
  });

  const payments = data?.data ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          Memuat pembayaran...
        </CardContent>
      </Card>
    );
  }
  if (payments.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pembayaran</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Rekening Tujuan</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead>Referensi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-36 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((row) => {
              const status = statusConfig[row.status] ?? {
                label: row.status,
                variant: "outline" as const,
              };

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="font-medium">{row.account_name ?? "-"}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.bank_name ?? "-"} · {row.bank_account ?? "-"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatRupiah(row.amount)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.payment_reference ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className={status.className}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelected(row)}
                    >
                      Ubah Status
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      {selected && (
        <UpdateStatusModal payment={selected} onClose={() => setSelected(null)} />
      )}
    </Card>
  );
}
