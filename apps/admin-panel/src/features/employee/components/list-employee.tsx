"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { SearchEmployeeRequest } from "@/features/employee/schemas/employee-schema";
import { cn } from "cn";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  search: SearchEmployeeRequest;
}

export default function ListEmployee({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching, isError, refetch } =
    useGetEmployees(search);

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

  const employees = data?.data ?? [];
  const paging = data?.paging;
  const currentPage = Number(search.page) || 1;
  const pageSize = Number(search.size) || 10;
  const startItem =
    paging && paging.total_item > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, paging?.total_item ?? 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base">Daftar karyawan</CardTitle>
          <CardDescription className="mt-1">
            {paging
              ? `${paging.total_item.toLocaleString("id-ID")} karyawan terdaftar`
              : "Informasi karyawan dan status kepegawaian"}
            {isFetching && !isLoading ? " · Memperbarui..." : ""}
          </CardDescription>
        </div>
        <div className="hidden size-10 items-center justify-center rounded-xl bg-primary/10 text-foreground sm:flex">
          <Users className="size-5" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr_1.2fr_1fr_1.4fr_0.7fr] items-center gap-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="ml-auto h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        ) : isError && !data ? (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <p className="text-sm font-medium">Data karyawan gagal dimuat.</p>
            <p className="text-sm text-muted-foreground">
              Periksa koneksi lalu coba lagi.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="mt-2"
            >
              Coba lagi
            </Button>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Users className="size-5" />
            </div>
            <p className="text-sm font-medium">
              {search.key ? "Karyawan tidak ditemukan" : "Belum ada karyawan"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search.key
                ? "Coba gunakan kata kunci pencarian yang berbeda."
                : "Data karyawan yang ditambahkan akan muncul di sini."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Karyawan</TableHead>
                <TableHead>Divisi &amp; jabatan</TableHead>
                <TableHead>Jenis kontrak</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const contract = employee.contracts?.[0];
                const active = employee.is_active ?? true;

                return (
                  <TableRow key={employee.id}>
                    <TableCell className="min-w-56 pl-6">
                      <Link
                        href={`/employees/${employee.id}/detail`}
                        className="group flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Avatar>
                          <AvatarImage
                            src={employee.user.image_url}
                            alt={employee.fullname}
                          />
                          <AvatarFallback>
                            {employee.fullname.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0">
                          <span className="block truncate font-medium group-hover:underline">
                            {employee.fullname}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {employee.employee_number}
                          </span>
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {contract ? (
                        <div className="min-w-36">
                          <p className="text-sm font-medium">
                            {contract.position.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contract.division.name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contract ? (
                        <Badge variant="secondary">
                          {contract.contract_type}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="min-w-40">
                        <p className="text-sm">{employee.phone || "—"}</p>
                        <p className="max-w-56 truncate text-xs text-muted-foreground">
                          {employee.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={active ? "default" : "outline"}
                        className={cn(
                          active
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200"
                            : "text-muted-foreground",
                        )}
                      >
                        {active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/employees/${employee.id}/detail`}>
                          Lihat
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {data && (
        <div className="flex flex-col gap-4 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center">
            <span>
              Menampilkan {startItem}–{endItem} dari{" "}
              {paging?.total_item.toLocaleString("id-ID") ?? 0} karyawan
            </span>
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap">Baris per halaman</span>
              <Select
                value={pageSize.toString()}
                onValueChange={handleSize}
              >
                <SelectTrigger
                  aria-label="Jumlah baris per halaman"
                  className="h-8 w-20"
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
          </div>

          {paging && paging.total_page > 1 && (
            <nav
              aria-label="Navigasi halaman karyawan"
              className="flex items-center justify-end gap-1"
            >
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman sebelumnya"
                disabled={currentPage <= 1}
                onClick={() => handlePaginate(currentPage - 1)}
              >
                <ChevronLeft />
              </Button>
              {Array.from(
                { length: Math.min(5, paging.total_page) },
                (_, index) => {
                  const startPage = Math.max(
                    1,
                    Math.min(currentPage - 2, paging.total_page - 4),
                  );
                  const page = startPage + index;
                  if (page > paging.total_page) return null;

                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "secondary" : "ghost"}
                      size="icon-sm"
                      aria-label={`Halaman ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                      onClick={() => handlePaginate(page)}
                    >
                      {page}
                    </Button>
                  );
                },
              )}
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman berikutnya"
                disabled={currentPage >= paging.total_page}
                onClick={() => handlePaginate(currentPage + 1)}
              >
                <ChevronRight />
              </Button>
            </nav>
          )}
        </div>
      )}
    </Card>
  );
}
