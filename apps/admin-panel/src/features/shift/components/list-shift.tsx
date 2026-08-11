"use client";
import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import Table from "@/components/ui/table/table";
import { useRouter } from "next/navigation";
import { useSearchShift } from "../hooks/use-search-shift";
import { SearchShiftRequest } from "../schemas/shift-schema";
import { AssignEmployeesShiftModal } from "./assign-employees-shift-modal";

interface Props {
  search: SearchShiftRequest;
}

export default function ListShift({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useSearchShift(search);

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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Table
        data={data?.data || []}
        keyExtractor={(row) => row.id}
        columns={[
          { header: "Nama", accessor: "name" },
          {
            header: "Toleransi Terlambat",
            accessor: (row) => (
              <span className="text-sm text-gray-600">
                {row.late_tolerance} menit
              </span>
            ),
          },
          {
            header: "Karyawan",
            accessor: (row) => (
              <span className="text-sm text-gray-500">
                {row.employees?.length ?? 0} karyawan
              </span>
            ),
          },
          {
            header: "Action",
            accessor: (row) => (
              <div className="flex items-center justify-end gap-3">
                <AssignEmployeesShiftModal shift={row} />
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
