"use client";

import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useZodForm } from "@/hooks/use-zod-form";
import { format } from "date-fns";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useEmployeeSanctionDetail } from "../hooks/use-employee-sanction-detail";
import { useDeleteEmployeeSanction } from "../hooks/use-delete-employee-sanction";
import { useUpdateEmployeeSanction } from "../hooks/use-update-employee-sanction";
import {
  EmployeeSanction,
  UpdateEmployeeSanctionSchema,
} from "../schemas/employee-sanction-schema";

interface Props {
  sanction: EmployeeSanction;
}

function formatDate(timestamp?: number | null) {
  return timestamp ? format(new Date(timestamp), "dd MMM yyyy") : "—";
}

function toDateInput(timestamp?: number | null) {
  return timestamp ? format(new Date(timestamp), "yyyy-MM-dd") : "";
}

export function EmployeeSanctionActions({ sanction }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const detailQuery = useEmployeeSanctionDetail(sanction.id, detailOpen);
  const detail = detailQuery.data?.data ?? sanction;

  const form = useZodForm(UpdateEmployeeSanctionSchema, {
    defaultValues: {
      reason: sanction.reason ?? "",
      start_date: toDateInput(sanction.start_date),
      end_date: toDateInput(sanction.end_date),
      status: sanction.status?.toLowerCase() === "inactive" ? "inactive" : "active",
    },
  });

  const updateMutation = useUpdateEmployeeSanction(sanction.id, () =>
    setEditOpen(false),
  );
  const deleteMutation = useDeleteEmployeeSanction(() =>
    setDeleteOpen(false),
  );

  const openEdit = () => {
    form.reset({
      reason: sanction.reason ?? "",
      start_date: toDateInput(sanction.start_date),
      end_date: toDateInput(sanction.end_date),
      status: sanction.status?.toLowerCase() === "inactive" ? "inactive" : "active",
    });
    setEditOpen(true);
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Detail sanksi ${sanction.employee?.fullname ?? ""}`}
          onClick={() => setDetailOpen(true)}
        >
          <Eye />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Edit sanksi ${sanction.employee?.fullname ?? ""}`}
          onClick={openEdit}
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          aria-label={`Hapus sanksi ${sanction.employee?.fullname ?? ""}`}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 />
        </Button>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Sanksi Karyawan</DialogTitle>
            <DialogDescription>
              Informasi lengkap surat peringatan karyawan.
            </DialogDescription>
          </DialogHeader>
          {detailQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : detailQuery.isError ? (
            <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
              Detail sanksi gagal dimuat. Tutup dialog lalu coba kembali.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Karyawan</p>
                  <p className="mt-1 font-medium">
                    {detail.employee?.fullname ?? "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {detail.employee?.employee_number ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Jenis Sanksi</p>
                  <p className="mt-1 font-medium">
                    {detail.sanction?.name ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Masa Berlaku</p>
                  <p className="mt-1 font-medium">
                    {formatDate(detail.start_date)} —{" "}
                    {formatDate(detail.end_date)}
                  </p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <Badge
                      variant={
                        detail.status?.toLowerCase() === "inactive"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {detail.status?.toLowerCase() === "inactive"
                        ? "Tidak Aktif"
                        : "Aktif"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-1 rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Alasan</p>
                <p className="whitespace-pre-wrap">{detail.reason || "—"}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">Dibuat Oleh</p>
                  <p className="mt-1 font-medium">{detail.created_by || "—"}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">
                    Dokumen Pendukung
                  </p>
                  {detail.document_url ? (
                    <a
                      href={detail.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block max-w-full break-all text-sm text-primary underline-offset-4 hover:underline"
                    >
                      {detail.document_url}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tidak ada dokumen
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailOpen(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) form.reset();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Sanksi Karyawan</DialogTitle>
            <DialogDescription>
              Perbarui alasan, masa berlaku, dan status sanksi{" "}
              {sanction.employee?.fullname}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((data) =>
              updateMutation.mutate(data),
            )}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor={`sanction-reason-${sanction.id}`}>Alasan</Label>
              <Input
                id={`sanction-reason-${sanction.id}`}
                {...form.register("reason")}
                aria-invalid={!!form.formState.errors.reason}
              />
              {form.formState.errors.reason && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.reason.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`sanction-start-${sanction.id}`}>
                  Tanggal Berlaku
                </Label>
                <Input
                  id={`sanction-start-${sanction.id}`}
                  type="date"
                  {...form.register("start_date")}
                  aria-invalid={!!form.formState.errors.start_date}
                />
                {form.formState.errors.start_date && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.start_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`sanction-end-${sanction.id}`}>
                  Tanggal Akhir
                </Label>
                <Input
                  id={`sanction-end-${sanction.id}`}
                  type="date"
                  {...form.register("end_date")}
                  aria-invalid={!!form.formState.errors.end_date}
                />
                {form.formState.errors.end_date && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.end_date.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`sanction-status-${sanction.id}`}>Status</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={`sanction-status-${sanction.id}`}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={updateMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus sanksi karyawan?</AlertDialogTitle>
            <AlertDialogDescription>
              Data sanksi untuk{" "}
              <span className="font-medium text-foreground">
                {sanction.employee?.fullname}
              </span>{" "}
              akan dihapus dan tidak dapat dipulihkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                deleteMutation.mutate(sanction.id);
              }}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
