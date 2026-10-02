"use client";

import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteEmployeeEducation } from "../hooks/use-delete-employee-education";
import { useGetEmployeeEducation } from "../hooks/use-get-employee-education";
import {
  EmployeeEducation,
  SearchEmployeeEducation,
} from "../schemas/employee-education-schema";
import { UpdateEmployeeEducationForm } from "./update-employee-education";

interface Props {
  search: SearchEmployeeEducation;
}

export default function ListEmployeeEducation({ search }: Props) {
  const router = useRouter();
  const { data, isLoading, isFetching, isError } =
    useGetEmployeeEducation(search);
  const deleteMutation = useDeleteEmployeeEducation();

  const [editTarget, setEditTarget] = useState<EmployeeEducation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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
          Riwayat pendidikan gagal dimuat. Coba muat ulang halaman.
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
                    "Jenjang",
                    "Institusi",
                    "Jurusan",
                    "Tahun",
                    "IPK",
                    "Aksi",
                  ].map((header) => (
                    <TableHead
                      key={header}
                      className={header === "Aksi" ? "text-right" : undefined}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Badge variant="secondary">{row.education_level}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {row.institution_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.major}
                    </TableCell>
                    <TableCell>
                      {row.start_year ? `${row.start_year} – ` : ""}
                      {row.graduation_year}
                    </TableCell>
                    <TableCell>
                      {row.gpa != null ? row.gpa.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditTarget(row)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(row.id)}
                          disabled={deleteMutation.isPending}
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Belum ada riwayat pendidikan.
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

      {editTarget && (
        <UpdateEmployeeEducationForm
          education={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus riwayat pendidikan?</AlertDialogTitle>
            <AlertDialogDescription>
              Data riwayat pendidikan ini akan dihapus dan tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={deleteMutation.isPending}>
                Batal
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (deleteTarget)
                    deleteMutation.mutate(deleteTarget, {
                      onSuccess: () => setDeleteTarget(null),
                    });
                }}
              >
                {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
