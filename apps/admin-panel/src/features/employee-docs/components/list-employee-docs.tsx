"use client";

import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toIDDate from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGetEmployeeDocs } from "../hooks/use-get-employee-docs";
import { SearchEmployeeDocument } from "../schemas/employee-docs-schema";

interface Props {
  search: SearchEmployeeDocument;
}

export default function ListEmployeeDocs({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching, isError } = useGetEmployeeDocs(search);

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
    return (
      <Card>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </CardContent>
      </Card>
    );
  }
  if (isError) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-destructive">
          Dokumen karyawan gagal dimuat. Coba muat ulang halaman.
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {data?.data?.length ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    "Tipe",
                    "Nama Dokumen",
                    "Nomor Dokumen",
                    "Tanggal Terbit",
                    "File",
                    "Tanggal Upload",
                  ].map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Badge variant="secondary">{row.doc_type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {row.doc_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.doc_number}
                    </TableCell>
                    <TableCell>{toIDDate(new Date(row.issued))}</TableCell>
                    <TableCell>
                      {row.file_url ? (
                        <a
                          href={row.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Lihat File
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{toIDDate(new Date(row.created_at))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Belum ada dokumen karyawan.
          </CardContent>
        </Card>
      )}
      {data && data?.data?.length > 0 && (
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
