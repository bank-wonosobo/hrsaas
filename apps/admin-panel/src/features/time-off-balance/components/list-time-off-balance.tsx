"use client";

import Table from "@/components/ui/table/table";
import { useGetTimeOffBalances } from "../hooks/use-get-time-off-balances";
import { SearchTimeOffBalance } from "../schemas/time-off-balance-schema";

interface Props {
  employeeId: string;
  search: SearchTimeOffBalance;
}

export default function ListTimeOffBalance({ employeeId, search }: Props) {
  const { data, isLoading } = useGetTimeOffBalances({
    ...search,
    employee_id: employeeId,
  });

  if (isLoading) {
    return <div className="text-sm text-zinc-400 py-4">Memuat data...</div>;
  }

  return (
    <Table
      data={data?.data ?? []}
      keyExtractor={(row) => row.id}
      columns={[
        {
          header: "Jenis Cuti",
          accessor: (row) => (
            <div className="flex flex-col">
              <span className="font-medium">{row.time_off_type.name}</span>
              <span className="text-xs text-zinc-400">{row.time_off_type.category}</span>
            </div>
          ),
        },
        {
          header: "Tahun",
          accessor: (row) => <span className="font-medium">{row.period_year}</span>,
        },
        {
          header: "Hak Cuti",
          accessor: (row) => (
            <span>{row.entitled_days} hari</span>
          ),
        },
        {
          header: "Terpakai",
          accessor: (row) => (
            <span className="text-orange-600">{row.used_days} hari</span>
          ),
        },
        {
          header: "Sisa",
          accessor: (row) => (
            <span
              className={
                row.remaining_days <= 0
                  ? "text-red-600 font-medium"
                  : "text-green-600 font-medium"
              }
            >
              {row.remaining_days} hari
            </span>
          ),
        },
        {
          header: "Berbasis Kuota",
          accessor: (row) => (
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                row.time_off_type.is_quota_based
                  ? "bg-blue-100 text-blue-700"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {row.time_off_type.is_quota_based ? "Ya" : "Tidak"}
            </span>
          ),
        },
      ]}
    />
  );
}
