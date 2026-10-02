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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchAttendance } from "../hooks/use-search-attendance";
import {
  Attendance,
  SearchAttendanceRequest,
} from "../schemas/attendance-schema";
import DetailAttendance from "./detail-attendance";

interface Props {
  search: SearchAttendanceRequest;
}

const STATUS_CLASSES: Record<string, string> = {
  HADIR:
    "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950",
  TERLAMBAT: "border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950",
  TIDAK_HADIR: "border-red-600/30 bg-red-50 text-red-700 dark:bg-red-950",
};

function formatTime(milliseconds: number) {
  if (!milliseconds) return "–";
  return new Date(milliseconds).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number) {
  if (!minutes) return "–";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}j`;
  return `${hours}j ${remainingMinutes}m`;
}

export default function ListAttendance({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useSearchAttendance(search);

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
                <TableHead>Tanggal</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Jam Kerja</TableHead>
                <TableHead>Istirahat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length ? (
                data.data.map((row: Attendance) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex min-w-40 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground">
                          {(row.employee_name ?? row.employee_id)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="font-medium">
                          {row.employee_name ?? row.employee_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(row.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium text-emerald-700 dark:text-emerald-400">
                      {formatTime(row.check_in_time)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium text-muted-foreground">
                      {formatTime(row.check_out_time)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDuration(row.total_work_minutes)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDuration(row.total_break_minutes)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_CLASSES[row.status]}
                      >
                        {row.status.replaceAll("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DetailAttendance attendance={row} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Tidak ada data kehadiran.
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
