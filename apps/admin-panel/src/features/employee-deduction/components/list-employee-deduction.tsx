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
import { useDeleteEmployeeDeduction } from "../hooks/use-delete-employee-deduction";
import { useGetEmployeeDeductions } from "../hooks/use-get-employee-deductions";
import { EmployeeDeduction } from "../schemas/employee-deduction-schema";
import EditEmployeeDeduction from "./edit-employee-deduction";

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

export default function ListEmployeeDeduction({ employeeId }: Props) {
  const [editTarget, setEditTarget] = useState<EmployeeDeduction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeDeduction | null>(null);
  const { mutate: remove, isPending: isDeleting } = useDeleteEmployeeDeduction();
  const { data, isLoading, isError, refetch } = useGetEmployeeDeductions({
    employee_id: employeeId,
    page: 1,
    size: 50,
  });
  const deductions = data?.data ?? [];

  return (
    <>
      {editTarget && (
        <EditEmployeeDeduction
          deduction={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p role="status" className="py-6 text-center text-sm text-muted-foreground">
              Memuat data potongan...
            </p>
          ) : isError ? (
            <div className="space-y-3 py-6 text-center">
              <p role="alert" className="text-sm text-destructive">
                Data potongan gagal dimuat. Silakan coba lagi.
              </p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Coba lagi
              </Button>
            </div>
          ) : deductions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada potongan.
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
                {deductions.map((deduction) => {
                  const active = isActivePeriod(
                    deduction.effective_date,
                    deduction.end_date,
                  );
                  return (
                    <TableRow key={deduction.id}>
                      <TableCell className="font-medium">
                        {deduction.salary_component?.name ?? "Potongan"}
                      </TableCell>
                      <TableCell>
                        {deduction.percentage > 0
                          ? `${deduction.percentage}% dari gaji pokok`
                          : formatRupiah(deduction.amount)}
                      </TableCell>
                      <TableCell>
                        {toIDDate(new Date(deduction.effective_date))} –{" "}
                        {deduction.end_date
                          ? toIDDate(new Date(deduction.end_date))
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
                            aria-label="Edit potongan"
                            onClick={() => setEditTarget(deduction)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Hapus potongan"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(deduction)}
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
            <AlertDialogTitle>Hapus potongan?</AlertDialogTitle>
            <AlertDialogDescription>
              Potongan ini akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeleting}>Batal</Button>
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
