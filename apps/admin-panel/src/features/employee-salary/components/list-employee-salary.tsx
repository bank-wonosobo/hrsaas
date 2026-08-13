"use client";

import toIDDate, { formatRupiah } from "@/lib/utils";
import { Pencil, Trash2, Wallet } from "lucide-react";
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

function SalaryCard({
  salary,
  onEdit,
  onDelete,
}: {
  salary: EmployeeSalary;
  onEdit: (s: EmployeeSalary) => void;
  onDelete: (s: EmployeeSalary) => void;
}) {
  const active = isActivePeriod(salary.effective_date, salary.end_date);

  return (
    <div className="border border-zinc-200 rounded-xl p-4 space-y-2 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wallet size={14} className="text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-800">
            {formatRupiah(salary.basic_salary)}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {active ? "Aktif" : "Berakhir"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(salary)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(salary)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="text-sm text-zinc-500">
        {toIDDate(new Date(salary.effective_date))}
        {" – "}
        {salary.end_date ? (
          toIDDate(new Date(salary.end_date))
        ) : (
          <span className="text-zinc-400 italic">masih berlaku</span>
        )}
      </div>
    </div>
  );
}

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

  if (salaries.length === 0)
    return (
      <div className="text-sm text-zinc-400 py-4 text-center">
        Belum ada data gaji pokok.
      </div>
    );

  return (
    <>
      {editTarget && (
        <EditEmployeeSalary
          salary={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      <div className="space-y-3">
        {salaries.map((salary) => (
          <SalaryCard
            key={salary.id}
            salary={salary}
            onEdit={setEditTarget}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </>
  );
}
