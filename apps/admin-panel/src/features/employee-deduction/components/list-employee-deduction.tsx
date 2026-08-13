"use client";

import toIDDate, { formatRupiah } from "@/lib/utils";
import { MinusCircle, Pencil, Trash2 } from "lucide-react";
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

function DeductionCard({
  deduction,
  onEdit,
  onDelete,
}: {
  deduction: EmployeeDeduction;
  onEdit: (d: EmployeeDeduction) => void;
  onDelete: (d: EmployeeDeduction) => void;
}) {
  const active = isActivePeriod(deduction.effective_date, deduction.end_date);

  return (
    <div className="border border-zinc-200 rounded-xl p-4 space-y-2 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <MinusCircle size={14} className="text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-800">
            {deduction.salary_component?.name ?? "Potongan"}
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
            onClick={() => onEdit(deduction)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(deduction)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="text-sm font-medium text-zinc-700">
        {deduction.percentage > 0
          ? `${deduction.percentage}% dari gaji pokok`
          : formatRupiah(deduction.amount)}
      </div>

      <div className="text-sm text-zinc-500">
        {toIDDate(new Date(deduction.effective_date))}
        {" – "}
        {deduction.end_date ? (
          toIDDate(new Date(deduction.end_date))
        ) : (
          <span className="text-zinc-400 italic">masih berlaku</span>
        )}
      </div>
    </div>
  );
}

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

  if (deductions.length === 0)
    return (
      <div className="text-sm text-zinc-400 py-4 text-center">
        Belum ada potongan.
      </div>
    );

  return (
    <>
      {editTarget && (
        <EditEmployeeDeduction
          deduction={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      <div className="space-y-3">
        {deductions.map((deduction) => (
          <DeductionCard
            key={deduction.id}
            deduction={deduction}
            onEdit={setEditTarget}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </>
  );
}
