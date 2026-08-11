"use client";

import { useGetPayroll } from "../hooks/use-get-payroll";
import PayrollApprovals from "./payroll-approvals";
import PayrollEmployeeTable from "./payroll-employee-table";
import PayrollHeader from "./payroll-header";
import PayrollPayments from "./payroll-payments";

export default function PayrollDetailView({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetPayroll(id);

  if (isLoading) {
    return <div className="text-sm text-zinc-400 py-8 text-center">Memuat data...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="text-sm text-red-500 py-8 text-center">
        Payroll tidak ditemukan.
      </div>
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
