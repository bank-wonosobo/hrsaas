"use client";
import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import Table from "@/components/ui/table/table";
import { useRouter } from "next/navigation";
import React from "react";
import { useSearchDivision } from "../hooks/use-search-division";
import { SearchDivisionRequest } from "../schemas/division-schema";

interface Props {
  search: SearchDivisionRequest;
}

export default function ListDivision({ search }: Props): React.ReactNode {
  const router = useRouter();

  const { data, isLoading, isFetching } = useSearchDivision(search);

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
            header: "Name",
            accessor: "name",
          },
          {
            header: "Deskripsi",
            accessor: "description",
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
              Menampilkan {data?.data.length} dari {data?.paging.total_item}{" "}
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
