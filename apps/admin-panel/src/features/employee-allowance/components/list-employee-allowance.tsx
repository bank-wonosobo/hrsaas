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
import { useDeleteEmployeeAllowance } from "../hooks/use-delete-employee-allowance";
import { useGetEmployeeAllowances } from "../hooks/use-get-employee-allowances";
import { EmployeeAllowance } from "../schemas/employee-allowance-schema";
import EditEmployeeAllowance from "./edit-employee-allowance";

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

export default function ListEmployeeAllowance({ employeeId }: Props) {
  const [editTarget, setEditTarget] = useState<EmployeeAllowance | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeAllowance | null>(
    null,
  );
  const { mutate: remove, isPending: isDeleting } =
    useDeleteEmployeeAllowance();
  const { data, isLoading, isError, refetch } = useGetEmployeeAllowances({
    employee_id: employeeId,
    page: 1,
    size: 50,
  });
  const allowances = data?.data ?? [];

  return (
    <>
      {editTarget && (
        <EditEmployeeAllowance
          allowance={editTarget}
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
              Memuat data tunjangan...
            </p>
          ) : isError ? (
            <div className="space-y-3 py-6 text-center">
              <p role="alert" className="text-sm text-destructive">
                Data tunjangan gagal dimuat. Silakan coba lagi.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                Coba lagi
              </Button>
            </div>
          ) : allowances.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada tunjangan.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Komponen</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Berlaku</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allowances.map((allowance) => {
                  const active = isActivePeriod(
                    allowance.effective_date,
                    allowance.end_date,
                  );
                  return (
                    <TableRow key={allowance.id}>
                      <TableCell className="font-medium">
                        {allowance.salary_component?.name ?? "Tunjangan"}
                      </TableCell>
                      <TableCell>
                        {allowance.salary_component?.calculation_type === "SALARY_PERCENTAGE"
                          ? `${allowance.percentage}% dari gaji pokok`
                          : allowance.salary_component?.calculation_type === "GROSS_PERCENTAGE"
                            ? `${allowance.percentage}% dari total pendapatan`
                            : allowance.salary_component?.calculation_type === "ATTENDANCE"
                              ? `${formatRupiah(allowance.amount)} / kehadiran`
                              : formatRupiah(allowance.amount)}
                      </TableCell>
                      <TableCell>
                        {toIDDate(new Date(allowance.effective_date))} –{" "}
                        {allowance.end_date
                          ? toIDDate(new Date(allowance.end_date))
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
                            aria-label="Edit tunjangan"
                            onClick={() => setEditTarget(allowance)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Hapus tunjangan"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(allowance)}
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
            <AlertDialogTitle>Hapus tunjangan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tunjangan ini akan dihapus. Tindakan ini tidak dapat dibatalkan.
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
