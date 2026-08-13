"use client";

import Table from "@/components/ui/table/table";
import { Check } from "lucide-react";
import { useGetAllTimeOffType } from "../hooks/use-getall-time-off-type";

export default function ListTimeOffType(): React.ReactNode {
  const { data, isLoading, isFetching } = useGetAllTimeOffType();

  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Table
        data={data || []}
        keyExtractor={(row) => row.id}
        columns={[
          {
            header: "Nama",
            accessor: "name",
          },
          {
            header: "Kategori",
            accessor: "category",
          },
          {
            header: "Berbasis Kuota",
            accessor: (row) => (
              <div className="w-full justify-center flex items-center gap-3">
                {row.is_quota_based ? <Check className="text-green-500" /> : "-"}
              </div>
            ),
            className: "!text-center",
          },
          {
            header: "Kuota Default",
            accessor: (row) => `${row.default_quota_days} hari`,
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
    </div>
  );
}
