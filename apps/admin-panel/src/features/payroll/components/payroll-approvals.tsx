"use client";

import Badge from "@/components/ui/badge/badge";
import toIDDate from "@/lib/utils";
import { useGetPayrollApprovals } from "../hooks/use-get-payroll-approvals";

export default function PayrollApprovals({ payrollId }: { payrollId: string }) {
  const { data, isLoading } = useGetPayrollApprovals(payrollId);
  const approvals = data?.data ?? [];

  if (isLoading) return null;
  if (approvals.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
      <h2 className="text-lg font-semibold">Riwayat Persetujuan</h2>
      <div className="space-y-3">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-zinc-800">
                Level {approval.level}
              </p>
              {approval.notes && (
                <p className="text-xs text-zinc-500 italic mt-0.5">
                  &ldquo;{approval.notes}&rdquo;
                </p>
              )}
              {approval.approved_at && (
                <p className="text-xs text-zinc-400 mt-0.5">
                  {toIDDate(new Date(approval.approved_at))}
                </p>
              )}
            </div>
            <Badge variant={approval.status === "APPROVED" ? "success" : "danger"}>
              {approval.status === "APPROVED" ? "Disetujui" : "Ditolak"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
