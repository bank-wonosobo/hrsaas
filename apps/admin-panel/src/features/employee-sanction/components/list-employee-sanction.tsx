"use client";
import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import Table from "@/components/ui/table/table";
import toIDDate from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";
import { useSearchSanction } from "../hooks/use-search-sanction";
import { SearchEmployeeSanctionRequest } from "../schemas/employee-sanction-schema";

interface Props {
  search: SearchEmployeeSanctionRequest;
}

export default function ListEmployeeSanction({
  search,
}: Props): React.ReactNode {
  const router = useRouter();

  const { data, isLoading, isFetching } = useSearchSanction(search);

  const handlePaginate = (number: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", number.toString());

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSize = (size: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("size", size);
    params.set("page", "1"); // reset page

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
            header: "Nama ",
            accessor: (row) => (
              <div className="flex items-center justify-start gap-3 min-w-40">
                <div className="h-9 w-9 rounded-full bg-gray-200 flex justify-center items-center">
                  {row.employee?.fullname?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium ">{row.employee.fullname}</span>
                  <span className="text-xs font-light text-zinc-400">
                    {row.employee.contracts?.[0].position.name} -
                    {row.employee.contracts?.[0].division.name}
                  </span>
                </div>
              </div>
            ),
          },
          {
            header: "Jenis Sanksi",
            accessor: (row) => <div>{row.sanction.name}</div>,
          },
          {
            header: "Reason",
            accessor: "reason",
          },
          {
            header: "Masa Berlaku",
            accessor: (row) => (
              <div className="text-sm whitespace-nowrap">
                {row.start_date ? toIDDate(new Date(row.start_date)) : ""}
                {" — "}
                {toIDDate(new Date(row.end_date))}
              </div>
            ),
          },
          {
            header: "Action",
            accessor: () => (
              <button className="text-sm text-gray-500 hover:text-black">
                Edit
              </button>
            ),
            className: "text-right",
          },
        ]}
      />
      {data && (
        <div className="flex flex-col w-full gap-5 justify-cente items-end mt-5">
          <div className="flex w-full items-center justify-between gap-x-1">
            <p className="font-bold text-xs">
              Menampilkan {data?.data?.length} dari {data?.paging?.total_item}{" "}
              total data.
            </p>
            <PageSelector
              onValueChange={(size) => handleSize(size)}
              value={search.size?.toString() ?? "0"}
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
