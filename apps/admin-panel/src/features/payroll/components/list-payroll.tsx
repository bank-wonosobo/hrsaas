"use client";
import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import Table from "@/components/ui/table/table";
import { formatRupiah } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeletePayroll } from "../hooks/use-delete-payroll";
import { useSearchPayroll } from "../hooks/use-search-payroll";
import { Payroll, SearchPayrollRequest } from "../schemas/payroll-schema";
import PayrollStatusBadge from "./payroll-status-badge";

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

interface Props {
  search: SearchPayrollRequest;
}

export default function ListPayroll({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useSearchPayroll(search);
  const { mutate: remove } = useDeletePayroll();

  const handlePaginate = (number: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", number.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSize = (size: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("size", size);
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDelete = (row: Payroll, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Yakin ingin menghapus payroll ${row.payroll_number}?`)) return;
    remove(row.id);
  };

  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Table
        data={data?.data || []}
        keyExtractor={(row) => row.id}
        columns={[
          {
            header: "No. Payroll",
            accessor: (row) => (
              <span className="font-mono text-xs text-zinc-600">
                {row.payroll_number}
              </span>
            ),
          },
          {
            header: "Periode",
            accessor: (row) => (
              <span className="font-medium">
                {monthNames[row.period_month - 1]} {row.period_year}
              </span>
            ),
          },
          {
            header: "Status",
            accessor: (row) => <PayrollStatusBadge status={row.status} />,
          },
          {
            header: "Gross",
            accessor: (row) => (
              <span className="text-sm">{formatRupiah(row.total_gross)}</span>
            ),
          },
          {
            header: "Potongan",
            accessor: (row) => (
              <span className="text-sm">{formatRupiah(row.total_deduction)}</span>
            ),
          },
          {
            header: "Net",
            accessor: (row) => (
              <span className="text-sm font-semibold">
                {formatRupiah(row.total_net)}
              </span>
            ),
          },
          {
            header: "",
            accessor: (row) => (
              <div className="flex items-center justify-end gap-3">
                {row.status === "DRAFT" && (
                  <button
                    onClick={(e) => handleDelete(row, e)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => router.push(`/payrolls/${row.id}`)}
                  className="text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Detail
                </button>
              </div>
            ),
            className: "text-right",
          },
        ]}
      />

      {data && (
        <div className="flex flex-col w-full gap-5 items-end mt-5">
          <div className="flex w-full items-center justify-between gap-x-1">
            <p className="font-bold text-xs">
              Menampilkan {data.data?.length} dari {data.paging?.total_item}{" "}
              total data.
            </p>
            <PageSelector
              onValueChange={(size) => handleSize(size)}
              value={search.size?.toString() ?? "10"}
            />
          </div>
          <Pagination
            currentPage={Number(search.page)}
            paging={data.paging}
            onPageChange={(number) => handlePaginate(number)}
          />
        </div>
      )}
    </div>
  );
}
