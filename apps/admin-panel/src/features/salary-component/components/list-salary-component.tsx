"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteSalaryComponent } from "../hooks/use-delete-salary-component";
import { useSearchSalaryComponent } from "../hooks/use-search-salary-component";
import {
  SalaryComponent,
  SearchSalaryComponentRequest,
} from "../schemas/salary-component-schema";
import EditSalaryComponent from "./edit-salary-component";

const calculationLabel: Record<string, string> = {
  FIXED: "Nominal Tetap",
  PERCENTAGE: "Persentase",
  SALARY_PERCENTAGE: "Persentase Gaji",
  GROSS_PERCENTAGE: "Persentase Bruto",
  ATTENDANCE: "Kehadiran",
  FORMULA: "Formula",
  MANUAL: "Manual",
};

interface Props {
  search: SearchSalaryComponentRequest;
}

export default function ListSalaryComponent({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching, isError } =
    useSearchSalaryComponent(search);
  const { mutate: remove } = useDeleteSalaryComponent();
  const [editTarget, setEditTarget] = useState<SalaryComponent | null>(null);

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

  const handleDelete = (row: SalaryComponent) => {
    if (!confirm(`Yakin ingin menghapus komponen "${row.name}"?`)) return;
    remove(row.id);
  };

  if (isLoading || isFetching) {
    return (
      <Card>
        <CardContent className="space-y-4">
          {[...Array(6)].map((_, index) => (
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
          Komponen gaji gagal dimuat. Coba muat ulang halaman.
        </CardContent>
      </Card>
    );
  }

  const components = data?.data ?? [];
  const totalPages = data?.paging?.total_page ?? 0;
  const currentPage = Number(search.page ?? 1);
  const pageStart = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const pageEnd = Math.min(totalPages, pageStart + 2);
  const pages =
    pageEnd > 0
      ? Array.from(
          { length: pageEnd - pageStart + 1 },
          (_, index) => pageStart + index,
        )
      : [];

  if (components.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">Belum ada komponen gaji</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambahkan komponen baru atau ubah kata pencarian.
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
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Perhitungan</TableHead>
                <TableHead>Kena Pajak</TableHead>
                <TableHead>Dasar BPJS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.code}
                  </TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        row.type === "EARNING"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                      }
                    >
                      {row.type === "EARNING" ? "Penambah" : "Pengurang"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {calculationLabel[row.calculation_type] ??
                      row.calculation_type}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={row.is_taxable}
                        disabled
                        aria-label={`${row.name}: kena pajak`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {row.is_taxable ? "Ya" : "Tidak"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={row.is_bpjs_base}
                        disabled
                        aria-label={`${row.name}: dasar BPJS`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {row.is_bpjs_base ? "Ya" : "Tidak"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.is_active ? "secondary" : "outline"}
                      className={
                        row.is_active
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : undefined
                      }
                    >
                      {row.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit komponen ${row.name}`}
                        onClick={() => setEditTarget(row)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Hapus komponen ${row.name}`}
                        onClick={() => handleDelete(row)}
                      >
                        <Trash2 className="text-destructive" />
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
            Menampilkan {components.length} dari {data?.paging?.total_item} data
            komponen.
          </p>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="salary-component-page-size"
              className="whitespace-nowrap text-sm text-muted-foreground"
            >
              Baris per halaman
            </Label>
            <Select
              value={search.size?.toString() ?? "10"}
              onValueChange={handleSize}
            >
              <SelectTrigger id="salary-component-page-size" className="w-20">
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
            aria-label="Navigasi halaman komponen gaji"
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

      {editTarget && (
        <EditSalaryComponent
          component={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
