"use client";

import toIDDate from "@/lib/utils";
import { Briefcase, Calendar, Pencil } from "lucide-react";
import { useState } from "react";
import { useGetEmployeeContracts } from "../hooks/use-get-employee-contracts";
import { EmployeeContract } from "../schemas/employee-contract-schema";
import EditEmployeeContract from "./edit-employee-contract";

interface Props {
  employeeId: string;
}

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const isContractActive = (start: number, end?: number | null) => {
  const now = Date.now();
  return start <= now && (!end || end >= now);
};

function ContractCard({
  contract,
  onEdit,
}: {
  contract: EmployeeContract;
  onEdit: (c: EmployeeContract) => void;
}) {
  const active = isContractActive(contract.start_date, contract.end_date) && contract.is_active;

  return (
    <div className="border border-zinc-200 rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-zinc-800">
            {contract.contract_type}
          </span>
          {contract.employee_status && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Gol. {contract.employee_status}
            </span>
          )}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {active ? "Aktif" : "Berakhir"}
          </span>
        </div>
        <button
          onClick={() => onEdit(contract)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors shrink-0"
        >
          <Pencil size={14} />
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm text-zinc-600 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Briefcase size={14} className="text-zinc-400" />
          <span>{contract.division.name}</span>
          <span className="text-zinc-300">·</span>
          <span>{contract.position.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-zinc-500">
        <Calendar size={14} className="text-zinc-400" />
        <span>{toIDDate(new Date(contract.start_date))}</span>
        <span>–</span>
        {contract.end_date ? (
          <span>{toIDDate(new Date(contract.end_date))}</span>
        ) : (
          <span className="text-zinc-400 italic">Tidak ada batas</span>
        )}
      </div>

      <div className="pt-1 border-t border-zinc-100 text-sm font-medium text-zinc-700">
        {formatRupiah(contract.salary)}
      </div>
    </div>
  );
}

export default function ListEmployeeContract({ employeeId }: Props) {
  const [editTarget, setEditTarget] = useState<EmployeeContract | null>(null);

  const { data, isLoading } = useGetEmployeeContracts({
    employee_id: employeeId,
    page: 1,
    size: 50,
  });

  if (isLoading)
    return <div className="text-sm text-zinc-400 py-4">Memuat data...</div>;

  const contracts = data?.data ?? [];

  if (contracts.length === 0)
    return (
      <div className="text-sm text-zinc-400 py-4 text-center">
        Belum ada kontrak.
      </div>
    );

  return (
    <>
      {editTarget && (
        <EditEmployeeContract
          contract={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      <div className="space-y-3">
        {contracts.map((contract) => (
          <ContractCard
            key={contract.id}
            contract={contract}
            onEdit={setEditTarget}
          />
        ))}
      </div>
    </>
  );
}
