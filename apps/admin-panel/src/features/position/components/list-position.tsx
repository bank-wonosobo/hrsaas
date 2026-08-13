"use client";

import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import Table from "@/components/ui/table/table";
import { getLevel } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchPosition } from "../hooks/use-search-position";
import { SearchPositionRequest } from "../schemas/position-schema";

interface Props {
  search: SearchPositionRequest;
}

export default function ListPosition({ search }: Props): React.ReactNode {
  const router = useRouter();

  const { data, isLoading, isFetching } = useSearchPosition(search);

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
            accessor: (row) => {
              const level = getLevel(row);
              return (
                <div className="flex items-center gap-3">
                  <span className="mr-2 text-gray-300 flex">
                    {Array.from({ length: level }).map((_, i) => (
                      <ArrowRight size={15} strokeWidth={3} key={i} />
                    ))}
                  </span>
                  <span className="font-medium">{row.name}</span>
                </div>
              );
            },
          },
          {
            header: "Approver",
            accessor: (row) => (
              <div className="w-full justify-center flex items-center gap-3">
                {row.is_approver ? <Check className="text-green-500" /> : "-"}
              </div>
            ),
            className: "!text-center",
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
