"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
      <PayrollEmployeeTable payroll={payroll} />
      <PayrollApprovals payrollId={payroll.id} />
      <PayrollPayments payrollId={payroll.id} />
    </div>
  );
}
