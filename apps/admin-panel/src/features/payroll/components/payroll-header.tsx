"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import { formatRupiah } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCalculatePayroll } from "../hooks/use-calculate-payroll";
import { useCancelPayroll } from "../hooks/use-cancel-payroll";
import { useDecidePayroll } from "../hooks/use-decide-payroll";
import { useDeletePayroll } from "../hooks/use-delete-payroll";
import { usePayPayroll } from "../hooks/use-pay-payroll";
import { useSubmitPayroll } from "../hooks/use-submit-payroll";
import { Payroll } from "../schemas/payroll-schema";
import PayrollStatusBadge from "./payroll-status-badge";

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function PayrollHeader({ payroll }: { payroll: Payroll }) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  const { mutate: calculate, isPending: isCalculating } = useCalculatePayroll(payroll.id);
  const { mutate: submit, isPending: isSubmitting } = useSubmitPayroll(payroll.id);
  const { mutate: cancel, isPending: isCancelling } = useCancelPayroll(payroll.id);
  const { mutate: pay, isPending: isPaying } = usePayPayroll(payroll.id);
  const { mutate: decide, isPending: isDeciding } = useDecidePayroll(payroll.id);
  const { mutate: remove, isPending: isDeleting } = useDeletePayroll();

  const handleCancel = () => {
    if (!confirm("Yakin ingin membatalkan payroll ini?")) return;
    cancel();
  };

  const handleDelete = () => {
    if (!confirm(`Yakin ingin menghapus payroll ${payroll.payroll_number}?`)) return;
    remove(payroll.id);
  };

  const handleReject = () => {
    if (!rejectNotes.trim()) return;
    decide(
      { decision: "REJECT", notes: rejectNotes },
      { onSuccess: () => { setRejectOpen(false); setRejectNotes(""); } },
    );
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/payrolls")}
            className="text-xs text-zinc-400 hover:text-zinc-700 mb-1"
          >
            &larr; Kembali ke daftar payroll
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{payroll.payroll_number}</h1>
            <PayrollStatusBadge status={payroll.status} />
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Periode {monthNames[payroll.period_month - 1]} {payroll.period_year}
            {payroll.payment_date && (
              <> · Dibayarkan {new Date(payroll.payment_date).toLocaleDateString("id-ID")}</>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {payroll.status === "DRAFT" && (
            <>
              <Button size="sm" loading={isCalculating} onClick={() => calculate()}>
                Hitung Payroll
              </Button>
              <Button
                size="sm"
                variant="outline"
                loading={isDeleting}
                onClick={handleDelete}
              >
                Hapus
              </Button>
            </>
          )}

          {payroll.status === "CALCULATED" && (
            <Button size="sm" loading={isSubmitting} onClick={() => submit()}>
              Ajukan Persetujuan
            </Button>
          )}

          {payroll.status === "SUBMITTED" && (
            <>
              <Button
                size="sm"
                loading={isDeciding}
                onClick={() => decide({ decision: "APPROVE" })}
              >
                Setujui
              </Button>
              <Button size="sm" variant="danger" onClick={() => setRejectOpen(true)}>
                Tolak
              </Button>
            </>
          )}

          {payroll.status === "APPROVED" && (
            <Button size="sm" loading={isPaying} onClick={() => pay()}>
              Proses Pembayaran
            </Button>
          )}

          {["DRAFT", "CALCULATED", "SUBMITTED"].includes(payroll.status) && (
            <Button
              size="sm"
              variant="outline"
              loading={isCancelling}
              onClick={handleCancel}
            >
              Batalkan
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
        <div>
          <p className="text-xs text-zinc-400">Total Gross</p>
          <p className="text-lg font-semibold">{formatRupiah(payroll.total_gross)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Total Potongan</p>
          <p className="text-lg font-semibold">{formatRupiah(payroll.total_deduction)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Total Net (Take Home Pay)</p>
          <p className="text-lg font-semibold text-green-700">
            {formatRupiah(payroll.total_net)}
          </p>
        </div>
      </div>

      <Modal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Tolak Payroll"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" loading={isDeciding} onClick={handleReject}>
              Tolak Payroll
            </Button>
          </>
        }
      >
        <FormField label="Catatan Penolakan" required>
          <Input
            label="Catatan"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
          />
        </FormField>
      </Modal>
    </div>
  );
}
