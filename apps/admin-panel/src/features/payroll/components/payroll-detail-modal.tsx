"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
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
        variant="outline"
        size="sm"
        prefixIcon={<PlusCircle size={14} />}
        onClick={() => setOpen(true)}
      >
        Tambah Penyesuaian
      </Button>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-3 rounded-xl border border-zinc-200 p-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Jenis" required>
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Jenis"
                options={payrollAdjustmentTypeOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>
        <FormField label="Nominal" required>
          <Input
            label="Nominal (Rp)"
            type="number"
            {...form.register("amount")}
            error={form.formState.errors.amount?.message}
          />
        </FormField>
      </div>
      <FormField label="Nama" required>
        <Input
          label="mis. THR Idul Fitri 2026"
          {...form.register("name")}
          error={form.formState.errors.name?.message}
        />
      </FormField>
      <FormField label="Keterangan">
        <Input label="Keterangan (opsional)" {...form.register("description")} />
      </FormField>
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isPending}>
          Simpan
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            form.reset();
            setOpen(false);
          }}
        >
          Batal
        </Button>
      </div>
    </form>
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={detail.employee?.fullname ?? "Detail Payroll Pegawai"}
      maxWidth="lg"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-zinc-50 p-3">
          <div>
            <p className="text-xs text-zinc-400">Gaji Pokok</p>
            <p className="text-sm font-semibold">
              {formatRupiah(detail.basic_salary)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400">Total Potongan</p>
            <p className="text-sm font-semibold">
              {formatRupiah(detail.total_deduction)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400">Take Home Pay</p>
            <p className="text-sm font-semibold text-green-700">
              {formatRupiah(detail.net_salary)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
            Allowance
          </p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Komponen</th>
                  <th className="px-3 py-2 text-right font-medium">Nilai Perhitungan</th>
                  <th className="px-3 py-2 text-right font-medium">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {allowanceItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-zinc-400 italic">
                      Tidak ada allowance.
                    </td>
                  </tr>
                ) : (
                  allowanceItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-zinc-700">{item.name}</td>
                      <td className="px-3 py-2 text-right text-zinc-500">
                        {item.calculation_value ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-zinc-800">
                        {formatRupiah(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t border-zinc-200 bg-zinc-50 text-sm font-semibold">
                <tr>
                  <td colSpan={2} className="px-3 py-2 text-right">Total Allowance</td>
                  <td className="px-3 py-2 text-right text-green-700">
                    {formatRupiah(totalAllowance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2 mt-4">
            Deduction
          </p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Komponen</th>
                  <th className="px-3 py-2 text-right font-medium">Nilai Perhitungan</th>
                  <th className="px-3 py-2 text-right font-medium">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {deductionItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-zinc-400 italic">
                      Tidak ada deduction.
                    </td>
                  </tr>
                ) : (
                  deductionItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-zinc-700">{item.name}</td>
                      <td className="px-3 py-2 text-right text-zinc-500">
                        {item.calculation_value ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-red-600">
                        -{formatRupiah(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t border-zinc-200 bg-zinc-50 text-sm font-semibold">
                <tr>
                  <td colSpan={2} className="px-3 py-2 text-right">Total Deduction</td>
                  <td className="px-3 py-2 text-right text-red-600">
                    -{formatRupiah(detail.total_deduction)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
            Penyesuaian (Bonus / THR / Koreksi)
          </p>
          <div className="space-y-1.5 mb-3">
            {(detail.adjustments ?? []).length === 0 && (
              <p className="text-sm text-zinc-400 italic">
                Belum ada penyesuaian.
              </p>
            )}
            {(detail.adjustments ?? []).map((adj) => (
              <div
                key={adj.id}
                className="flex items-center justify-between text-sm border-b border-zinc-100 pb-1.5"
              >
                <div>
                  <span className="font-medium text-zinc-800">{adj.name}</span>
                  <span className="ml-2 text-xs text-zinc-400">{adj.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${adj.amount < 0 ? "text-red-600" : "text-zinc-800"}`}
                  >
                    {formatRupiah(adj.amount)}
                  </span>
                  {editable && (
                    <button
                      onClick={() => handleDeleteAdjustment(adj.id)}
                      className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {editable ? (
            <AdjustmentForm payrollDetailId={detail.id} payrollId={payrollId} />
          ) : (
            <p className="text-xs text-zinc-400 italic">
              Penyesuaian hanya bisa diubah saat payroll berstatus
              Draft/Terhitung.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
