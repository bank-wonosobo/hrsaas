"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { MapPin, Search, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useAssignEmployeeOfficeLocation } from "../hooks/use-assign-employee-office-location";
import { useDeleteOfficeLocation } from "../hooks/use-delete-office-location";
import { useDetailOfficeLocation } from "../hooks/use-detail-office-location";
import { useUpdateOfficeLocation } from "../hooks/use-update-office-location";

interface Props {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

function EditableLocationField({
  id,
  label,
  value,
  type = "text",
  onSave,
}: {
  id: string;
  label: string;
  value: string;
  type?: "text" | "number";
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {editing ? (
        <div className="flex gap-2">
          <Input
            id={id}
            type={type}
            step={type === "number" ? "any" : undefined}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onSave(draft);
              setEditing(false);
            }}
          >
            Simpan
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
          >
            Batal
          </Button>
        </div>
      ) : (
        <div className="flex min-h-9 items-center justify-between gap-3 rounded-xl border px-3 py-2">
          <span className="text-sm">{value || "-"}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
          >
            Ubah
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DetailOfficeLocationModal({
  id,
  isOpen,
  onClose,
}: Props) {
  const { data, isLoading, isError } = useDetailOfficeLocation(id);
  const updateMutation = useUpdateOfficeLocation(id);
  const deleteMutation = useDeleteOfficeLocation();
  const assignMutation = useAssignEmployeeOfficeLocation();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  const {
    data: employeesData,
    isLoading: employeesLoading,
    isError: employeesError,
  } = useGetEmployees({ key: employeeSearch, page: 1, size: 200 });

  const location = data?.data;
  const assignedEmployees = location?.employees ?? [];
  const assignedIds = new Set(assignedEmployees.map((employee) => employee.id));
  const availableEmployees = (employeesData?.data ?? []).filter(
    (employee) => !assignedIds.has(employee.id),
  );
  const selectedEmployee = availableEmployees.find(
    (employee) => employee.id === selectedEmployeeId,
  );

  const handleAssign = () => {
    if (!selectedEmployeeId) return;
    assignMutation.mutate(
      { employeeId: selectedEmployeeId, officeLocationId: id },
      {
        onSuccess: () => {
          setSelectedEmployeeId("");
          setEmployeeSearch("");
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setConfirmDelete(false);
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {isLoading ? (
            <>
              <DialogHeader>
                <DialogTitle>Detail Lokasi Kantor</DialogTitle>
                <DialogDescription>Memuat informasi lokasi...</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </>
          ) : isError || !location ? (
            <>
              <DialogHeader>
                <DialogTitle>Detail Lokasi Kantor</DialogTitle>
                <DialogDescription className="text-destructive">
                  Data lokasi gagal dimuat.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Tutup
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
                    <MapPin className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="truncate">{location.name}</DialogTitle>
                    <DialogDescription className="line-clamp-2">
                      {location.address}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5">
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>Informasi Lokasi</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <EditableLocationField
                      id="location-name"
                      label="Nama"
                      value={location.name}
                      onSave={(value) =>
                        updateMutation.mutate({ name: value })
                      }
                    />
                    <EditableLocationField
                      id="location-address"
                      label="Alamat"
                      value={location.address}
                      onSave={(value) =>
                        updateMutation.mutate({ address: value })
                      }
                    />
                    <EditableLocationField
                      id="location-latitude"
                      label="Latitude"
                      type="number"
                      value={location.lat.toString()}
                      onSave={(value) => {
                        const number = Number(value);
                        if (Number.isFinite(number)) {
                          updateMutation.mutate({ lat: number });
                        }
                      }}
                    />
                    <EditableLocationField
                      id="location-longitude"
                      label="Longitude"
                      type="number"
                      value={location.lng.toString()}
                      onSave={(value) => {
                        const number = Number(value);
                        if (Number.isFinite(number)) {
                          updateMutation.mutate({ lng: number });
                        }
                      }}
                    />
                    <EditableLocationField
                      id="location-radius"
                      label="Radius (meter)"
                      type="number"
                      value={location.radius_meters.toString()}
                      onSave={(value) => {
                        const number = Number(value);
                        if (Number.isFinite(number) && number >= 0) {
                          updateMutation.mutate({ radius: number });
                        }
                      }}
                    />
                    <div className="space-y-2">
                      <Label>Status Lokasi</Label>
                      <div className="flex min-h-9 items-center gap-3 rounded-xl border px-3 py-2">
                        <Checkbox
                          id="location-active"
                          checked={location.is_active}
                          onCheckedChange={(checked) =>
                            updateMutation.mutate({
                              is_active: checked === true,
                            })
                          }
                        />
                        <Label htmlFor="location-active">
                          {location.is_active ? "Aktif" : "Nonaktif"}
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card size="sm">
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle>Karyawan Ter-assign</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {assignedEmployees.length} karyawan ditugaskan ke lokasi ini.
                      </p>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                      <Users className="size-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assignedEmployees.length ? (
                      <div className="max-h-48 divide-y overflow-y-auto rounded-xl border px-3">
                        {assignedEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center gap-3 py-3"
                          >
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                              {employee.fullname.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {employee.fullname}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {employee.employee_number}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-xl border p-4 text-center text-sm text-muted-foreground">
                        Belum ada karyawan yang ditugaskan.
                      </p>
                    )}

                    <div className="space-y-2 border-t pt-4">
                      <Label htmlFor="assign-employee-search">
                        Cari karyawan untuk ditugaskan
                      </Label>
                      <div className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="assign-employee-search"
                          value={employeeSearch}
                          onChange={(event) => {
                            setEmployeeSearch(event.target.value);
                            setSelectedEmployeeId("");
                          }}
                          placeholder="Nama atau nomor karyawan..."
                          className="pl-9"
                        />
                      </div>
                      {employeesLoading ? (
                        <Skeleton className="h-12 w-full" />
                      ) : employeesError ? (
                        <p className="text-sm text-destructive">
                          Daftar karyawan gagal dimuat.
                        </p>
                      ) : availableEmployees.length ? (
                        <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border p-2">
                          {availableEmployees.map((employee) => (
                            <Button
                              key={employee.id}
                              type="button"
                              variant={
                                selectedEmployeeId === employee.id
                                  ? "secondary"
                                  : "ghost"
                              }
                              onClick={() => setSelectedEmployeeId(employee.id)}
                              className="h-auto w-full justify-between gap-3 px-3 py-2 text-left"
                            >
                              <span className="truncate text-sm font-medium">
                                {employee.fullname}
                              </span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {employee.employee_number}
                              </span>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {employeeSearch
                            ? "Tidak ada karyawan yang cocok atau semua hasil sudah ditugaskan."
                            : "Tidak ada karyawan yang dapat ditugaskan."}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          {selectedEmployee
                            ? `Dipilih: ${selectedEmployee.fullname}`
                            : "Pilih karyawan dari hasil pencarian."}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAssign}
                          disabled={
                            !selectedEmployeeId || assignMutation.isPending
                          }
                        >
                          {assignMutation.isPending
                            ? "Mengassign..."
                            : "Assign Karyawan"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card size="sm">
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">Hapus Lokasi</p>
                      <p className="text-sm text-muted-foreground">
                        Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 />
                      Hapus Lokasi
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDelete}
        onOpenChange={(open) => setConfirmDelete(open)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Lokasi Kantor</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus lokasi{" "}
              <span className="font-semibold text-foreground">
                {location?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={deleteMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus Lokasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
