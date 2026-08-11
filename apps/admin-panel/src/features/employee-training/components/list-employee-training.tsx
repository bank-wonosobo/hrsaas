"use client";

import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import Table from "@/components/ui/table/table";
import toIDDate from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteEmployeeTraining } from "../hooks/use-delete-employee-training";
import { useGetEmployeeTraining } from "../hooks/use-get-employee-training";
import { EmployeeTraining, SearchEmployeeTraining } from "../schemas/employee-training-schema";
import { UpdateEmployeeTrainingForm } from "./update-employee-training";

interface Props {
  search: SearchEmployeeTraining;
}

export default function ListEmployeeTraining({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useGetEmployeeTraining(search);
  const deleteMutation = useDeleteEmployeeTraining();

  const [editTarget, setEditTarget] = useState<EmployeeTraining | null>(null);

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

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus riwayat pelatihan ini?")) return;
    deleteMutation.mutate(id);
  };

  if (isLoading || isFetching) {
    return <div className="text-sm text-zinc-400 py-4">Memuat data...</div>;
  }

  return (
    <div>
      <Table
        data={data?.data ?? []}
        keyExtractor={(row) => row.id}
        columns={[
          {
            header: "Nama Pelatihan",
            accessor: (row) => (
              <span className="font-medium">{row.training_name}</span>
            ),
          },
          {
            header: "Penyelenggara",
            accessor: (row) => (
              <span className="text-sm text-zinc-600">{row.organizer}</span>
            ),
          },
          {
            header: "Periode",
            accessor: (row) => (
              <span className="text-sm whitespace-nowrap">
                {toIDDate(new Date(row.start_date))}
                {row.end_date ? ` – ${toIDDate(new Date(row.end_date))}` : ""}
              </span>
            ),
          },
          {
            header: "Sertifikat",
            accessor: (row) =>
              row.certificate_url ? (
                <a
                  href={row.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Lihat
                </a>
              ) : (
                <span className="text-zinc-400 text-sm">-</span>
              ),
          },
          {
            header: "Aksi",
            accessor: (row) => (
              <div className="flex gap-3 justify-end">
                <button
                  className="text-sm text-zinc-500 hover:text-black"
                  onClick={() => setEditTarget(row)}
                >
                  Edit
                </button>
                <button
                  className="text-sm text-red-400 hover:text-red-600"
                  onClick={() => handleDelete(row.id)}
                  disabled={deleteMutation.isPending}
                >
                  Hapus
                </button>
              </div>
            ),
            className: "text-right",
          },
        ]}
      />

      {data && (
        <div className="flex flex-col w-full gap-5 justify-center items-end mt-5">
          <div className="flex w-full items-center justify-between gap-x-1">
            <p className="font-bold text-xs">
              Menampilkan {data?.data?.length ?? 0} dari{" "}
              {data?.paging?.total_item} total data.
            </p>
            <PageSelector
              onValueChange={(size) => handleSize(size)}
              value={search.size?.toString() ?? "10"}
            />
          </div>
          <Pagination
            currentPage={Number(search.page ?? 1)}
            paging={data.paging}
            onPageChange={(number) => handlePaginate(number)}
          />
        </div>
      )}

      {editTarget && (
        <UpdateEmployeeTrainingForm
          training={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
