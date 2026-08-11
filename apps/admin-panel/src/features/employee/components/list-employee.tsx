"use client";

import { Pagination } from "@/components/shared/pagination/pagination";
import { PageSelector } from "@/components/shared/page-selector/page-selector";
import Table from "@/components/ui/table/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetEmployees } from "../hooks/use-get-employee";
import { SearchEmployeeRequest } from "../schemas/employee-schema";

interface Props {
  search: SearchEmployeeRequest;
}

export default function ListEmployee({ search }: Props): React.ReactNode {
  const router = useRouter();
  const { data, isLoading, isFetching } = useGetEmployees(search);

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
    return <div className="text-sm text-zinc-400 py-6">Memuat data...</div>;
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
              <Link href={`/employees/${row.id}/detail`} className="flex items-center gap-3 min-w-50 group">
                <div className="h-9 w-9 rounded-full bg-zinc-100 text-zinc-700 font-semibold flex items-center justify-center text-sm shrink-0">
                  {row.fullname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-zinc-900 group-hover:underline underline-offset-2">{row.fullname}</p>
                  <p className="text-xs text-zinc-400">{row.employee_number}</p>
                </div>
              </Link>
            ),
          },
          {
            header: "Divisi & Jabatan",
            accessor: (row) => {
              const contract = row.contracts?.[0];
              if (!contract) return <span className="text-zinc-400 text-xs">–</span>;
              return (
                <div>
                  <p className="text-sm text-zinc-800">{contract.position.name}</p>
                  <p className="text-xs text-zinc-400">{contract.division.name}</p>
                </div>
              );
            },
          },
          {
            header: "Jenis Kontrak",
            accessor: (row) => {
              const contract = row.contracts?.[0];
              if (!contract) return <span className="text-zinc-400 text-xs">–</span>;
              return (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">
                  {contract.contract_type}
                </span>
              );
            },
          },
          {
            header: "Kontak",
            accessor: (row) => (
              <div>
                <p className="text-sm text-zinc-700">{row.phone}</p>
                <p className="text-xs text-zinc-400">{row.user.email}</p>
              </div>
            ),
          },
          {
            header: "Status",
            accessor: (row) => {
              const active = row.is_active ?? true;
              return (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {active ? "Aktif" : "Nonaktif"}
                </span>
              );
            },
          },
          {
            header: "",
            accessor: (row) => (
              <Link
                href={`/employees/${row.id}/detail`}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900 underline underline-offset-2"
              >
                Detail
              </Link>
            ),
            className: "text-right",
          },
        ]}
      />
      {data && (
        <div className="flex flex-col w-full gap-5 items-end mt-5">
          <div className="flex w-full items-center justify-between gap-x-1">
            <p className="font-bold text-xs text-zinc-500">
              Menampilkan {data?.data?.length} dari {data?.paging?.total_item} total data.
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