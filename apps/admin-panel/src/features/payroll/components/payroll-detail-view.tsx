"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useGetPayroll } from "../hooks/use-get-payroll";
import PayrollApprovals from "./payroll-approvals";
import PayrollEmployeeTable from "./payroll-employee-table";
import PayrollHeader from "./payroll-header";
import PayrollPayments from "./payroll-payments";

export default function PayrollDetailView({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetPayroll(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-40" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">Payroll tidak ditemukan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Data payroll gagal dimuat atau sudah tidak tersedia.
          </p>
        </CardContent>
      </Card>
    );
  }

  const payroll = data.data;

  return (
    <div className="space-y-6">
      <PayrollHeader payroll={payroll} />
      {payroll.status === "DRAFT" && (
        <div
          role="note"
          className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
            />
            <div>
              <p className="font-medium">Cek Grid Gaji sebelum kalkulasi</p>
              <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">
                Pastikan tunjangan dan potongan setiap karyawan sudah benar
                sebelum menekan &ldquo;Hitung Payroll&rdquo;.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/salary-grid">
              Buka Grid Gaji
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      )}
      <PayrollEmployeeTable payroll={payroll} />
      <PayrollApprovals payrollId={payroll.id} />
      <PayrollPayments payrollId={payroll.id} />
    </div>
  );
}
