"use client";

import toIDDate, { formatRupiah } from "@/lib/utils";
import Table from "@/components/ui/table/table";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteEmployeeSalary } from "../hooks/use-delete-employee-salary";
import { useGetEmployeeSalaries } from "../hooks/use-get-employee-salaries";
import { EmployeeSalary } from "../schemas/employee-salary-schema";
import EditEmployeeSalary from "./edit-employee-salary";

interface Props {
  employeeId: string;
}

const isActivePeriod = (start: number, end?: number | null) => {
  const now = Date.now();
  return start <= now && (!end || end >= now);
};

export default function ListEmployeeSalary({ employeeId }: Props) {
  const [editTarget, setEditTarget] = useState<EmployeeSalary | null>(null);
  const { mutate: remove } = useDeleteEmployeeSalary();

  const { data, isLoading } = useGetEmployeeSalaries({
    employee_id: employeeId,
    page: 1,
    size: 50,
  });

  const handleDelete = (salary: EmployeeSalary) => {
    if (!confirm("Yakin ingin menghapus riwayat gaji pokok ini?")) return;
    remove(salary.id);
  };

  if (isLoading)
    return <div className="text-sm text-zinc-400 py-4">Memuat data...</div>;

  const salaries = data?.data ?? [];

  return (
    <>
      {editTarget && (
        <EditEmployeeSalary
          salary={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      <Table
        data={salaries}
        keyExtractor={(salary) => salary.id}
        emptyMessage="Belum ada data gaji pokok."
        columns={[
          { header: "Gaji pokok", accessor: (salary) => formatRupiah(salary.basic_salary) },
          {
            header: "Berlaku",
            accessor: (salary) => `${toIDDate(new Date(salary.effective_date))} – ${salary.end_date ? toIDDate(new Date(salary.end_date)) : "masih berlaku"}`,
          },
          {
            header: "Status",
            accessor: (salary) => {
              const active = isActivePeriod(salary.effective_date, salary.end_date);
              return <span className={`font-medium ${active ? "text-green-700" : "text-zinc-500"}`}>{active ? "Aktif" : "Berakhir"}</span>;
            },
          },
          {
            header: "Aksi",
            accessor: (salary) => (
              <div className="flex gap-1">
                <button aria-label="Edit gaji" onClick={() => setEditTarget(salary)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"><Pencil size={14} /></button>
                <button aria-label="Hapus gaji" onClick={() => handleDelete(salary)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
