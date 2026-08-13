"use client";
import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import Table from "@/components/ui/table/table";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSearchOfficeLocation } from "../hooks/use-search-office-location";
import { SearchOfficeLocationRequest } from "../schemas/office-location-schema";
import { AssignEmployeesOfficeLocationModal } from "./assign-employees-office-location-modal";
import DetailOfficeLocationModal from "./detail-office-location-modal";

interface Props {
  search: SearchOfficeLocationRequest;
}

export default function ListOfficeLocation({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useSearchOfficeLocation(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
            header: "Nama",
            accessor: (row) => (
              <div className="flex items-center gap-3 min-w-40">
                <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                </div>
                <span className="font-medium">{row.name}</span>
              </div>
            ),
          },
          {
            header: "Alamat",
            accessor: (row) => (
              <span className="text-gray-600 text-sm">{row.address}</span>
            ),
          },
          {
            header: "Koordinat",
            accessor: (row) => (
              <span className="text-xs text-gray-500 font-mono">
                {row.lat}, {row.lng}
              </span>
            ),
          },
          {
            header: "Radius",
            accessor: (row) => (
              <span className="text-sm">{row.radius_meters} m</span>
            ),
          },
          {
            header: "Status",
            accessor: (row) => (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  row.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {row.is_active ? "Aktif" : "Nonaktif"}
              </span>
            ),
          },
          {
            header: "",
            accessor: (row) => (
              <div className="flex items-center justify-end gap-3">
                <AssignEmployeesOfficeLocationModal officeLocation={row} />
                <button
                  className="text-sm text-gray-500 hover:text-black transition-colors"
                  onClick={() => setSelectedId(row.id)}
                >
                  Detail
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

      {selectedId && (
        <DetailOfficeLocationModal
          id={selectedId}
          isOpen={!!selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
