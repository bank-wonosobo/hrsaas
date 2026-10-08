"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toIDDate from "@/lib/utils";
import { useGetPayrollApprovals } from "../hooks/use-get-payroll-approvals";

export default function PayrollApprovals({ payrollId }: { payrollId: string }) {
  const { data, isLoading } = useGetPayrollApprovals(payrollId);
  const approvals = data?.data ?? [];

  if (isLoading) return null;
  if (approvals.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Persetujuan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">Level {approval.level}</p>
              {approval.notes && (
                <p className="mt-0.5 text-sm italic text-muted-foreground">
                  &ldquo;{approval.notes}&rdquo;
                </p>
              )}
              {approval.approved_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {toIDDate(new Date(approval.approved_at))}
                </p>
              )}
            </div>
            <Badge
              variant={approval.status === "APPROVED" ? "secondary" : "destructive"}
              className={
                approval.status === "APPROVED"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : undefined
              }
            >
              {approval.status === "APPROVED" ? "Disetujui" : "Ditolak"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
