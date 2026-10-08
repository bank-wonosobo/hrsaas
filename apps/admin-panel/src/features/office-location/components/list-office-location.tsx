"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
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
  const { data, isLoading, isFetching, isError } =
    useSearchOfficeLocation(search);
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
          Data lokasi kantor gagal dimuat. Coba muat ulang halaman.
        </CardContent>
      </Card>
    );
  }

  const locations = data?.data ?? [];
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

  if (locations.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">Belum ada lokasi kantor</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambahkan lokasi kantor atau ubah kata pencarian.
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
                <TableHead>Nama</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Koordinat</TableHead>
                <TableHead>Radius</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-36 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex min-w-40 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <MapPin className="size-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal text-sm text-muted-foreground">
                    {row.address}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.lat}, {row.lng}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.radius_meters} m
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
                      <AssignEmployeesOfficeLocationModal
                        officeLocation={row}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedId(row.id)}
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
            Menampilkan {locations.length} dari {data?.paging?.total_item}{" "}
            lokasi.
          </p>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="office-location-page-size"
              className="whitespace-nowrap text-sm text-muted-foreground"
            >
              Baris per halaman
            </Label>
            <Select
              value={search.size?.toString() ?? "10"}
              onValueChange={handleSize}
            >
              <SelectTrigger id="office-location-page-size" className="w-20">
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
            aria-label="Navigasi lokasi kantor"
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
                  <span
                    aria-hidden="true"
                    className="px-1 text-muted-foreground"
                  >
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
                  <span
                    aria-hidden="true"
                    className="px-1 text-muted-foreground"
                  >
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
