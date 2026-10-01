"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchVisit } from "../hooks/use-search-visit";
import { SearchVisitRequest, Visit } from "../schemas/visit-schema";
import DetailVisit from "./detail-visit";

interface Props {
  search: SearchVisitRequest;
}

function getVisitTime(details: Visit["details"]) {
  const visitIn = details.find((detail) => detail.visit_type === "IN");
  const visitOut = details.find((detail) => detail.visit_type === "OUT");

  if (visitIn && visitOut) return `${visitIn.visit_at} – ${visitOut.visit_at}`;
  if (visitIn) return `${visitIn.visit_at} – berlangsung`;
  return visitOut?.visit_at ?? "–";
}

export default function ListVisit({ search }: Props): React.ReactNode {
  const router = useRouter();
  const { data, isLoading, isFetching } = useSearchVisit(search);

  const handlePaginate = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSize = (size: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("size", size);
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const currentPage = Math.max(1, Number(search.page) || 1);
  const totalPages = Math.max(1, data?.paging.total_page ?? 1);

  if (isLoading || isFetching) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Karyawan</TableHead>
                <TableHead>Klien</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jam kunjungan</TableHead>
                <TableHead>Kunjungan</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length ? (
                data.data.map((row: Visit) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex min-w-40 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground">
                          {row.employee_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{row.employee_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{row.client_name}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {toIDDate(new Date(row.date))}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {getVisitTime(row.details)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {row.details.length} detail
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-64 truncate text-muted-foreground">
                      {row.details[0]?.note || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DetailVisit visit={row} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Tidak ada data kunjungan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data && (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {data.data.length} dari {data.paging.total_item} data
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                Baris per halaman
              </span>
              <Select
                value={search.size?.toString() ?? "10"}
                onValueChange={handleSize}
              >
                <SelectTrigger
                  className="w-20"
                  size="sm"
                  aria-label="Baris per halaman"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className="flex items-center gap-1"
              aria-label="Navigasi halaman"
            >
              <span className="mr-2 whitespace-nowrap text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman pertama"
                disabled={currentPage <= 1}
                onClick={() => handlePaginate(1)}
              >
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman sebelumnya"
                disabled={currentPage <= 1}
                onClick={() => handlePaginate(currentPage - 1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman berikutnya"
                disabled={currentPage >= totalPages}
                onClick={() => handlePaginate(currentPage + 1)}
              >
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman terakhir"
                disabled={currentPage >= totalPages}
                onClick={() => handlePaginate(totalPages)}
              >
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
