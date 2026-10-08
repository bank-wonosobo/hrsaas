"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    <Card>
      <CardHeader className="gap-4 border-b sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => router.push("/payrolls")}
            className="-ml-2 mb-1 h-auto px-2 text-muted-foreground"
          >
            ← Kembali ke daftar payroll
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">{payroll.payroll_number}</h1>
            <PayrollStatusBadge status={payroll.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Periode {monthNames[payroll.period_month - 1]} {payroll.period_year}
            {payroll.payment_date && (
              <> · Dibayarkan {new Date(payroll.payment_date).toLocaleDateString("id-ID")}</>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {payroll.status === "DRAFT" && (
            <>
              <Button size="sm" disabled={isCalculating} onClick={() => calculate()}>
                {isCalculating ? "Menghitung..." : "Hitung Payroll"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
            </>
          )}

          {payroll.status === "CALCULATED" && (
            <Button size="sm" disabled={isSubmitting} onClick={() => submit()}>
              {isSubmitting ? "Mengajukan..." : "Ajukan Persetujuan"}
            </Button>
          )}

          {payroll.status === "SUBMITTED" && (
            <>
              <Button
                size="sm"
                disabled={isDeciding}
                onClick={() => decide({ decision: "APPROVE" })}
              >
                {isDeciding ? "Menyetujui..." : "Setujui"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>
                Tolak
              </Button>
            </>
          )}

          {payroll.status === "APPROVED" && (
            <Button size="sm" disabled={isPaying} onClick={() => pay()}>
              {isPaying ? "Memproses..." : "Proses Pembayaran"}
            </Button>
          )}

          {["DRAFT", "CALCULATED", "SUBMITTED"].includes(payroll.status) && (
            <Button
              size="sm"
              variant="outline"
              disabled={isCancelling}
              onClick={handleCancel}
            >
              {isCancelling ? "Membatalkan..." : "Batalkan"}
            </Button>
          )}
        </div>
      </div>
      </CardHeader>

      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">Total Gross</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{formatRupiah(payroll.total_gross)}</p>
        </div>
        <div className="rounded-2xl bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">Total Potongan</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{formatRupiah(payroll.total_deduction)}</p>
        </div>
        <div className="rounded-2xl bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">Total Net (Take Home Pay)</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-primary">
            {formatRupiah(payroll.total_net)}
          </p>
        </div>
      </CardContent>

      <Dialog open={rejectOpen} onOpenChange={(open) => !open && setRejectOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak Payroll</DialogTitle>
            <DialogDescription>
              Berikan catatan agar pengajuan payroll dapat diperbaiki.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="payroll-reject-notes">
              Catatan Penolakan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="payroll-reject-notes"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Tuliskan alasan penolakan"
              aria-invalid={rejectOpen && !rejectNotes.trim()}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={isDeciding}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeciding || !rejectNotes.trim()}
              onClick={handleReject}
            >
              {isDeciding ? "Menolak..." : "Tolak Payroll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
