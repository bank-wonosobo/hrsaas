"use client";
import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import Badge from "@/components/ui/badge/badge";
import Table from "@/components/ui/table/table";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteSalaryComponent } from "../hooks/use-delete-salary-component";
import { useSearchSalaryComponent } from "../hooks/use-search-salary-component";
import {
  SalaryComponent,
  SearchSalaryComponentRequest,
} from "../schemas/salary-component-schema";
import EditSalaryComponent from "./edit-salary-component";

const calculationLabel: Record<string, string> = {
  FIXED: "Nominal Tetap",
  PERCENTAGE: "Persentase",
  FORMULA: "Formula",
  MANUAL: "Manual",
};

interface Props {
  search: SearchSalaryComponentRequest;
}

export default function ListSalaryComponent({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useSearchSalaryComponent(search);
  const { mutate: remove } = useDeleteSalaryComponent();
  const [editTarget, setEditTarget] = useState<SalaryComponent | null>(null);

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

  const handleDelete = (row: SalaryComponent) => {
    if (!confirm(`Yakin ingin menghapus komponen "${row.name}"?`)) return;
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
            header: "Kode",
            accessor: (row) => (
              <span className="font-mono text-xs text-zinc-600">{row.code}</span>
            ),
          },
          { header: "Nama", accessor: "name" },
          {
            header: "Tipe",
            accessor: (row) => (
              <Badge variant={row.type === "EARNING" ? "success" : "danger"}>
                {row.type === "EARNING" ? "Penambah" : "Pengurang"}
              </Badge>
            ),
          },
          {
            header: "Perhitungan",
            accessor: (row) => (
              <span className="text-sm text-zinc-600">
                {calculationLabel[row.calculation_type] ?? row.calculation_type}
              </span>
            ),
          },
          {
            header: "Kena Pajak",
            accessor: (row) => (row.is_taxable ? "Ya" : "Tidak"),
          },
          {
            header: "Dasar BPJS",
            accessor: (row) => (row.is_bpjs_base ? "Ya" : "Tidak"),
          },
          {
            header: "Status",
            accessor: (row) => (
              <Badge variant={row.is_active ? "success" : "default"}>
                {row.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            ),
          },
          {
            header: "",
            accessor: (row) => (
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditTarget(row)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(row)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
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

      {editTarget && (
        <EditSalaryComponent
          component={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
