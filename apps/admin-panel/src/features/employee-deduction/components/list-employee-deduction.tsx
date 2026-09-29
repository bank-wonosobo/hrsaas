"use client";

import toIDDate, { formatRupiah } from "@/lib/utils";
import Table from "@/components/ui/table/table";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteEmployeeDeduction } from "../hooks/use-delete-employee-deduction";
import { useGetEmployeeDeductions } from "../hooks/use-get-employee-deductions";
import { EmployeeDeduction } from "../schemas/employee-deduction-schema";
import EditEmployeeDeduction from "./edit-employee-deduction";

interface Props {
  employeeId: string;
}

const isActivePeriod = (start: number, end?: number | null) => {
  const now = Date.now();
  return start <= now && (!end || end >= now);
};

export default function ListEmployeeDeduction({ employeeId }: Props) {
  const [editTarget, setEditTarget] = useState<EmployeeDeduction | null>(null);
  const { mutate: remove } = useDeleteEmployeeDeduction();

  const { data, isLoading } = useGetEmployeeDeductions({
    employee_id: employeeId,
    page: 1,
    size: 50,
  });

  const handleDelete = (deduction: EmployeeDeduction) => {
    if (!confirm("Yakin ingin menghapus potongan ini?")) return;
    remove(deduction.id);
  };

  if (isLoading)
    return <div className="text-sm text-zinc-400 py-4">Memuat data...</div>;

  const deductions = data?.data ?? [];

  return (
    <>
      {editTarget && (
        <EditEmployeeDeduction
          deduction={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      <Table
        data={deductions}
        keyExtractor={(deduction) => deduction.id}
        emptyMessage="Belum ada potongan."
        columns={[
          { header: "Komponen", accessor: (deduction) => deduction.salary_component?.name ?? "Potongan" },
          { header: "Nilai", accessor: (deduction) => deduction.percentage > 0 ? `${deduction.percentage}% dari gaji pokok` : formatRupiah(deduction.amount) },
          { header: "Berlaku", accessor: (deduction) => `${toIDDate(new Date(deduction.effective_date))} – ${deduction.end_date ? toIDDate(new Date(deduction.end_date)) : "masih berlaku"}` },
          { header: "Status", accessor: (deduction) => { const active = isActivePeriod(deduction.effective_date, deduction.end_date); return <span className={`font-medium ${active ? "text-green-700" : "text-zinc-500"}`}>{active ? "Aktif" : "Berakhir"}</span>; } },
          { header: "Aksi", accessor: (deduction) => <div className="flex gap-1"><button aria-label="Edit potongan" onClick={() => setEditTarget(deduction)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"><Pencil size={14} /></button><button aria-label="Hapus potongan" onClick={() => handleDelete(deduction)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button></div> },
        ]}
      />
    </>
  );
}
