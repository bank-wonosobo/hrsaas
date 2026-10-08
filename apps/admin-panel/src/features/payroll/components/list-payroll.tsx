"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeletePayroll } from "../hooks/use-delete-payroll";
import { useSearchPayroll } from "../hooks/use-search-payroll";
import { Payroll, SearchPayrollRequest } from "../schemas/payroll-schema";
import PayrollStatusBadge from "./payroll-status-badge";

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

interface Props {
  search: SearchPayrollRequest;
}

export default function ListPayroll({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isError } = useSearchPayroll(search);
  const { mutate: remove } = useDeletePayroll();

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

  const handleDelete = (row: Payroll, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Yakin ingin menghapus payroll ${row.payroll_number}?`)) return;
    remove(row.id);
  };

  const totalPages = data?.paging?.total_page ?? 0;
  const currentPage = Number(search.page ?? 1);
  const pageStart = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const pageEnd = Math.min(totalPages, pageStart + 2);
  const pages =
    pageEnd > 0
      ? Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => pageStart + index)
      : [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-destructive">
          Data payroll gagal dimuat. Coba muat ulang halaman.
        </CardContent>
      </Card>
    );
  }

  if (!data?.data?.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">Belum ada data payroll</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ubah filter atau buat payroll untuk memulai.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>No. Payroll</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Potongan</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="w-28 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.payroll_number}
                  </TableCell>
                  <TableCell className="font-medium">
                    {monthNames[row.period_month - 1]} {row.period_year}
                  </TableCell>
                  <TableCell>
                    <PayrollStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(row.total_gross)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(row.total_deduction)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatRupiah(row.total_net)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {row.status === "DRAFT" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Hapus payroll ${row.payroll_number}`}
                          onClick={(e) => handleDelete(row, e)}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/payrolls/${row.id}`)}
                      >
                        Detail
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm text-muted-foreground">
            Menampilkan {data.data.length} dari {data.paging?.total_item} data
            payroll.
          </p>
          <div className="flex items-center gap-2">
            <Label htmlFor="payroll-page-size" className="whitespace-nowrap text-sm text-muted-foreground">
              Baris per halaman
            </Label>
            <Select
              value={search.size?.toString() ?? "10"}
              onValueChange={handleSize}
            >
              <SelectTrigger id="payroll-page-size" className="w-20">
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
        </div>
        {totalPages > 1 && (
          <nav
            aria-label="Navigasi halaman payroll"
            className="flex items-center gap-1"
          >
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Halaman sebelumnya"
              disabled={currentPage <= 1}
              onClick={() => handlePaginate(currentPage - 1)}
            >
              <ChevronLeft />
            </Button>
            {pageStart > 1 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginate(1)}
                >
                  1
                </Button>
                {pageStart > 2 && (
                  <span aria-hidden="true" className="px-1 text-muted-foreground">
                    …
                  </span>
                )}
              </>
            )}
            {pages.map((page) => (
              <Button
                key={page}
                type="button"
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`Halaman ${page}`}
                onClick={() => handlePaginate(page)}
              >
                {page}
              </Button>
            ))}
            {pageEnd < totalPages && (
              <>
                {pageEnd < totalPages - 1 && (
                  <span aria-hidden="true" className="px-1 text-muted-foreground">
                    …
                  </span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginate(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Halaman berikutnya"
              disabled={currentPage >= totalPages}
              onClick={() => handlePaginate(currentPage + 1)}
            >
              <ChevronRight />
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
}
