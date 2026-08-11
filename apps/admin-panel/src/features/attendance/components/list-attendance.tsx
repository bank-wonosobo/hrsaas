"use client";

import { Pagination } from "@/components/shared/pagination/pagination";
import { PageSelector } from "@/components/shared/page-selector/page-selector";
import Table from "@/components/ui/table/table";
import { useRouter } from "next/navigation";
import { useSearchAttendance } from "../hooks/use-search-attendance";
import { Attendance, SearchAttendanceRequest } from "../schemas/attendance-schema";
import DetailAttendance from "./detail-attendance";

interface Props {
  search: SearchAttendanceRequest;
}

const STATUS_STYLE: Record<string, string> = {
  HADIR: "bg-green-100 text-green-700",
  TERLAMBAT: "bg-yellow-100 text-yellow-700",
  TIDAK_HADIR: "bg-red-100 text-red-700",
};

function formatTime(ms: number) {
  if (!ms) return "-";
  return new Date(ms).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ListAttendance({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useSearchAttendance(search);

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

  if (isLoading || isFetching) return <div>Loading...</div>;

  return (
    <div>
      <Table<Attendance>
        data={data?.data || []}
        keyExtractor={(row) => row.id}
        emptyMessage="Tidak ada data kehadiran"
        columns={[
          {
            header: "Karyawan",
            accessor: (row) => (
              <div className="flex items-center gap-3 min-w-36">
                <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center font-semibold text-sm text-zinc-600 shrink-0">
                  {(row.employee_name ?? row.employee_id).charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm">
                  {row.employee_name ?? row.employee_id}
                </span>
              </div>
            ),
          },
          {
            header: "Tanggal",
            accessor: (row) => (
              <span className="text-sm">
                {new Date(row.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            ),
          },
          {
            header: "Check-in",
            accessor: (row) => (
              <span className="text-sm font-medium text-green-700">
                {formatTime(row.check_in_time)}
              </span>
            ),
          },
          {
            header: "Check-out",
            accessor: (row) => (
              <span className="text-sm font-medium text-red-500">
                {formatTime(row.check_out_time)}
              </span>
            ),
          },
          {
            header: "Status",
            accessor: (row) => (
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[row.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                {row.status}
              </span>
            ),
          },
          {
            header: "",
            accessor: (row) => <DetailAttendance attendance={row} />,
          },
        ]}
      />

      {data && (
        <div className="flex flex-col w-full gap-5 justify-center items-end mt-5">
          <div className="flex w-full items-center justify-between gap-x-1">
            <p className="font-bold text-xs">
              Menampilkan {data.data?.length} dari {data.paging?.total_item} total data.
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
