"use client";

import Badge from "@/components/ui/badge/badge";
import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
import Table from "@/components/ui/table/table";
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

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "default",
  PROCESSING: "warning",
  SUCCESS: "success",
  FAILED: "danger",
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
    <Modal
      isOpen
      onClose={onClose}
      title={`Ubah Status Pembayaran — ${payment.account_name ?? ""}`}
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-update-payment-status" loading={isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="form-update-payment-status"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField label="Status" required>
          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Status"
                options={paymentStatusOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>
        <FormField label="Referensi Pembayaran" hint="Nomor referensi dari bank (opsional).">
          <Input label="Referensi" {...form.register("payment_reference")} />
        </FormField>
      </form>
    </Modal>
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

  if (isLoading) return null;
  if (payments.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
      <h2 className="text-lg font-semibold">Pembayaran</h2>

      <Table
        data={payments}
        keyExtractor={(row) => row.id}
        columns={[
          {
            header: "Rekening Tujuan",
            accessor: (row) => (
              <div>
                <p className="font-medium text-zinc-800">{row.account_name ?? "-"}</p>
                <p className="text-xs text-zinc-400">
                  {row.bank_name ?? "-"} · {row.bank_account ?? "-"}
                </p>
              </div>
            ),
          },
          {
            header: "Nominal",
            accessor: (row) => (
              <span className="text-sm font-medium">{formatRupiah(row.amount)}</span>
            ),
          },
          {
            header: "Referensi",
            accessor: (row) => (
              <span className="text-xs text-zinc-500 font-mono">
                {row.payment_reference ?? "-"}
              </span>
            ),
          },
          {
            header: "Status",
            accessor: (row) => (
              <Badge variant={statusVariant[row.status] ?? "default"}>{row.status}</Badge>
            ),
          },
          {
            header: "",
            accessor: (row) => (
              <button
                onClick={() => setSelected(row)}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Ubah Status
              </button>
            ),
            className: "text-right",
          },
        ]}
      />

      {selected && (
        <UpdateStatusModal payment={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
