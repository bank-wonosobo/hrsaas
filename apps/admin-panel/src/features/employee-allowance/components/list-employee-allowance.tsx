"use client";

import toIDDate, { formatRupiah } from "@/lib/utils";
import Table from "@/components/ui/table/table";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteEmployeeAllowance } from "../hooks/use-delete-employee-allowance";
import { useGetEmployeeAllowances } from "../hooks/use-get-employee-allowances";
import { EmployeeAllowance } from "../schemas/employee-allowance-schema";
import EditEmployeeAllowance from "./edit-employee-allowance";

interface Props {
  employeeId: string;
}

const isActivePeriod = (start: number, end?: number | null) => {
  const now = Date.now();
  return start <= now && (!end || end >= now);
};

export default function ListEmployeeAllowance({ employeeId }: Props) {
  const [editTarget, setEditTarget] = useState<EmployeeAllowance | null>(null);
  const { mutate: remove } = useDeleteEmployeeAllowance();

  const { data, isLoading } = useGetEmployeeAllowances({
    employee_id: employeeId,
    page: 1,
    size: 50,
  });

  const handleDelete = (allowance: EmployeeAllowance) => {
    if (!confirm("Yakin ingin menghapus tunjangan ini?")) return;
    remove(allowance.id);
  };

  if (isLoading)
    return <div className="text-sm text-zinc-400 py-4">Memuat data...</div>;

  const allowances = data?.data ?? [];

  return (
    <>
      {editTarget && (
        <EditEmployeeAllowance
          allowance={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      <Table
        data={allowances}
        keyExtractor={(allowance) => allowance.id}
        emptyMessage="Belum ada tunjangan."
        columns={[
          { header: "Komponen", accessor: (allowance) => allowance.salary_component?.name ?? "Tunjangan" },
          { header: "Nilai", accessor: (allowance) => allowance.percentage > 0 ? `${allowance.percentage}% dari gaji pokok` : formatRupiah(allowance.amount) },
          { header: "Berlaku", accessor: (allowance) => `${toIDDate(new Date(allowance.effective_date))} – ${allowance.end_date ? toIDDate(new Date(allowance.end_date)) : "masih berlaku"}` },
          { header: "Status", accessor: (allowance) => { const active = isActivePeriod(allowance.effective_date, allowance.end_date); return <span className={`font-medium ${active ? "text-green-700" : "text-zinc-500"}`}>{active ? "Aktif" : "Berakhir"}</span>; } },
          { header: "Aksi", accessor: (allowance) => <div className="flex gap-1"><button aria-label="Edit tunjangan" onClick={() => setEditTarget(allowance)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"><Pencil size={14} /></button><button aria-label="Hapus tunjangan" onClick={() => handleDelete(allowance)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button></div> },
        ]}
      />
    </>
  );
}
