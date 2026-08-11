"use client";

import { Pagination } from "@/components/shared/pagination/pagination";
import { PageSelector } from "@/components/shared/page-selector/page-selector";
import Table from "@/components/ui/table/table";
import toIDDate from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSearchVisit } from "../hooks/use-search-visit";
import { SearchVisitRequest } from "../schemas/visit-schema";
import DetailVisit from "./detail-visit";

interface Props {
  search: SearchVisitRequest;
}

export default function ListVisit({ search }: Props): React.ReactNode {
  const router = useRouter();
  const { data, isLoading, isFetching } = useSearchVisit(search);

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
          {
            header: "Karyawan",
            accessor: (row) => (
              <div className="flex items-center justify-start gap-3 min-w-40">
                <div className="h-9 w-9 rounded-full bg-gray-200 flex justify-center items-center font-medium">
                  {row.employee_name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{row.employee_name}</span>
              </div>
            ),
          },
          {
            header: "Klien",
            accessor: (row) => <span>{row.client_name}</span>,
          },
          {
            header: "Tanggal",
            accessor: (row) => (
              <span>{toIDDate(new Date(row.date))}</span>
            ),
          },
          {
            header: "Kunjungan",
            accessor: (row) => (
              <span className="font-medium">{row.details.length} detail</span>
            ),
          },
          {
            header: "Catatan",
            accessor: (row) => (
              <span className="text-gray-500 italic text-sm">
                {row.details[0]?.note || "-"}
              </span>
            ),
          },
          {
            header: "Dibuat",
            accessor: (row) => (
              <span>{toIDDate(new Date(row.created_at * 1000))}</span>
            ),
          },
          {
            header: "",
            accessor: (row) => <DetailVisit visit={row} />,
          },
        ]}
      />

      {data && (
        <div className="flex flex-col w-full gap-5 justify-center items-end mt-5">
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
