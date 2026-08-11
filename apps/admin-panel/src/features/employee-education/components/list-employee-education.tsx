"use client";

import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import Table from "@/components/ui/table/table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteEmployeeEducation } from "../hooks/use-delete-employee-education";
import { useGetEmployeeEducation } from "../hooks/use-get-employee-education";
import { EmployeeEducation, SearchEmployeeEducation } from "../schemas/employee-education-schema";
import { UpdateEmployeeEducationForm } from "./update-employee-education";

interface Props {
  search: SearchEmployeeEducation;
}

export default function ListEmployeeEducation({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useGetEmployeeEducation(search);
  const deleteMutation = useDeleteEmployeeEducation();

  const [editTarget, setEditTarget] = useState<EmployeeEducation | null>(null);

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
    if (!confirm("Yakin ingin menghapus riwayat pendidikan ini?")) return;
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
            header: "Jenjang",
            accessor: (row) => (
              <span className="text-xs font-medium bg-zinc-100 px-2 py-1 rounded">
                {row.education_level}
              </span>
            ),
          },
          {
            header: "Institusi",
            accessor: (row) => (
              <span className="font-medium">{row.institution_name}</span>
            ),
          },
          {
            header: "Jurusan",
            accessor: (row) => (
              <span className="text-sm text-zinc-600">{row.major}</span>
            ),
          },
          {
            header: "Tahun",
            accessor: (row) => (
              <span className="text-sm whitespace-nowrap">
                {row.start_year ? `${row.start_year} – ` : ""}
                {row.graduation_year}
              </span>
            ),
          },
          {
            header: "IPK",
            accessor: (row) => (
              <span className="text-sm">
                {row.gpa != null ? row.gpa.toFixed(2) : "-"}
              </span>
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
        <UpdateEmployeeEducationForm
          education={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
