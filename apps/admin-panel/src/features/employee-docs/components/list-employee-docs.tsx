"use client";

import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import Table from "@/components/ui/table/table";
import toIDDate from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGetEmployeeDocs } from "../hooks/use-get-employee-docs";
import { SearchEmployeeDocument } from "../schemas/employee-docs-schema";

interface Props {
  search: SearchEmployeeDocument;
}

export default function ListEmployeeDocs({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useGetEmployeeDocs(search);

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
            header: "Tipe",
            accessor: (row) => (
              <span className="text-xs font-medium bg-zinc-100 px-2 py-1 rounded">
                {row.doc_type}
              </span>
            ),
          },
          {
            header: "Nama Dokumen",
            accessor: (row) => (
              <span className="font-medium">{row.doc_name}</span>
            ),
          },
          {
            header: "Nomor Dokumen",
            accessor: (row) => (
              <span className="text-sm text-zinc-600">{row.doc_number}</span>
            ),
          },
          {
            header: "Tanggal Terbit",
            accessor: (row) => (
              <span className="text-sm whitespace-nowrap">
                {toIDDate(new Date(row.issued))}
              </span>
            ),
          },
          {
            header: "File",
            accessor: (row) =>
              row.file_url ? (
                <a
                  href={row.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Lihat File
                </a>
              ) : (
                <span className="text-zinc-400 text-sm">-</span>
              ),
          },
          {
            header: "Tanggal Upload",
            accessor: (row) => (
              <span className="text-sm whitespace-nowrap">
                {toIDDate(new Date(row.created_at))}
              </span>
            ),
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
    </div>
  );
}
