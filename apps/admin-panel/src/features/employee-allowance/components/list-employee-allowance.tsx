"use client";

import toIDDate, { formatRupiah } from "@/lib/utils";
import { Pencil, PiggyBank, Trash2 } from "lucide-react";
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

function AllowanceCard({
  allowance,
  onEdit,
  onDelete,
}: {
  allowance: EmployeeAllowance;
  onEdit: (a: EmployeeAllowance) => void;
  onDelete: (a: EmployeeAllowance) => void;
}) {
  const active = isActivePeriod(allowance.effective_date, allowance.end_date);

  return (
    <div className="border border-zinc-200 rounded-xl p-4 space-y-2 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <PiggyBank size={14} className="text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-800">
            {allowance.salary_component?.name ?? "Tunjangan"}
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
            onClick={() => onEdit(allowance)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(allowance)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="text-sm font-medium text-zinc-700">
        {allowance.percentage > 0
          ? `${allowance.percentage}% dari gaji pokok`
          : formatRupiah(allowance.amount)}
      </div>

      <div className="text-sm text-zinc-500">
        {toIDDate(new Date(allowance.effective_date))}
        {" – "}
        {allowance.end_date ? (
          toIDDate(new Date(allowance.end_date))
        ) : (
          <span className="text-zinc-400 italic">masih berlaku</span>
        )}
      </div>
    </div>
  );
}

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

  if (allowances.length === 0)
    return (
      <div className="text-sm text-zinc-400 py-4 text-center">
        Belum ada tunjangan.
      </div>
    );

  return (
    <>
      {editTarget && (
        <EditEmployeeAllowance
          allowance={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      <div className="space-y-3">
        {allowances.map((allowance) => (
          <AllowanceCard
            key={allowance.id}
            allowance={allowance}
            onEdit={setEditTarget}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </>
  );
}
