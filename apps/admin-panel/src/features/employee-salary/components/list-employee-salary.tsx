"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toIDDate, { formatRupiah } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteEmployeeSalary } from "../hooks/use-delete-employee-salary";
import { useGetEmployeeSalaries } from "../hooks/use-get-employee-salaries";
import { EmployeeSalary } from "../schemas/employee-salary-schema";
import EditEmployeeSalary from "./edit-employee-salary";

interface Props {
  employeeId: string;
}

function isActivePeriod(start: number, end?: number | null) {
  const now = Date.now();
  const startTime = new Date(start).getTime();
  if (!Number.isFinite(startTime) || startTime > now) return false;
  if (end == null) return true;
  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) return false;
  endDate.setHours(23, 59, 59, 999);
  return endDate.getTime() >= now;
}

export default function ListEmployeeSalary({ employeeId }: Props) {
  const [editTarget, setEditTarget] = useState<EmployeeSalary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeSalary | null>(null);
  const { mutate: remove, isPending: isDeleting } = useDeleteEmployeeSalary();
  const { data, isLoading, isError, refetch } = useGetEmployeeSalaries({
    employee_id: employeeId,
    page: 1,
    size: 50,
  });
  const salaries = data?.data ?? [];

  return (
    <>
      {editTarget && (
        <EditEmployeeSalary
          salary={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p
              role="status"
              className="py-6 text-center text-sm text-muted-foreground"
            >
              Memuat data gaji pokok...
            </p>
          ) : isError ? (
            <div className="space-y-3 py-6 text-center">
              <p role="alert" className="text-sm text-destructive">
                Data gaji pokok gagal dimuat. Silakan coba lagi.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                Coba lagi
              </Button>
            </div>
          ) : salaries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada data gaji pokok.
            </p>
          ) : (
            <Table className="border">
              <TableHeader className="bg-primary/50">
                <TableRow>
                  <TableHead>Gaji pokok</TableHead>
                  <TableHead>Berlaku</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaries.map((salary) => {
                  const active = isActivePeriod(
                    salary.effective_date,
                    salary.end_date,
                  );
                  return (
                    <TableRow key={salary.id}>
                      <TableCell className="font-medium">
                        {formatRupiah(salary.basic_salary)}
                      </TableCell>
                      <TableCell>
                        {toIDDate(new Date(salary.effective_date))} –{" "}
                        {salary.end_date
                          ? toIDDate(new Date(salary.end_date))
                          : "masih berlaku"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={active ? "secondary" : "outline"}>
                          {active ? "Aktif" : "Berakhir"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Edit gaji"
                            onClick={() => setEditTarget(salary)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Hapus gaji"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(salary)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus riwayat gaji pokok?</AlertDialogTitle>
            <AlertDialogDescription>
              Riwayat gaji pokok ini akan dihapus. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeleting}>
                Batal
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={() => {
                  if (deleteTarget) remove(deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
