"use client";

import Table from "@/components/ui/table/table";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";
import { Payroll, PayrollDetail } from "../schemas/payroll-schema";
import PayrollDetailModal from "./payroll-detail-modal";

interface Props {
  payroll: Payroll;
}

export default function PayrollEmployeeTable({ payroll }: Props) {
  const [selected, setSelected] = useState<PayrollDetail | null>(null);
  const details = payroll.details ?? [];
  const editable = payroll.status === "DRAFT" || payroll.status === "CALCULATED";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
      <h2 className="text-lg font-semibold">Rincian per Pegawai</h2>

      <Table
        data={details}
        keyExtractor={(row) => row.id}
        emptyMessage="Payroll belum dihitung. Klik 'Hitung Payroll' untuk membuat rincian per pegawai."
        columns={[
          {
            header: "Pegawai",
            accessor: (row) => (
              <div>
                <p className="font-medium text-zinc-800">
                  {row.employee?.fullname ?? row.employee_id}
                </p>
                <p className="text-xs text-zinc-400">{row.employee?.employee_number}</p>
              </div>
            ),
          },
          {
            header: "Gaji Pokok",
            accessor: (row) => (
              <span className="text-sm">{formatRupiah(row.basic_salary)}</span>
            ),
          },
          {
            header: "Gross",
            accessor: (row) => (
              <span className="text-sm">{formatRupiah(row.gross_salary)}</span>
            ),
          },
          {
            header: "Potongan",
            accessor: (row) => (
              <span className="text-sm text-red-600">
                -{formatRupiah(row.total_deduction)}
              </span>
            ),
          },
          {
            header: "Take Home Pay",
            accessor: (row) => (
              <span className="text-sm font-semibold text-green-700">
                {formatRupiah(row.net_salary)}
              </span>
            ),
          },
          {
            header: "",
            accessor: (row) => (
              <button
                onClick={() => setSelected(row)}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Detail
              </button>
            ),
            className: "text-right",
          },
        ]}
      />

      {selected && (
        <PayrollDetailModal
          detail={selected}
          payrollId={payroll.id}
          editable={editable}
          isOpen={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
