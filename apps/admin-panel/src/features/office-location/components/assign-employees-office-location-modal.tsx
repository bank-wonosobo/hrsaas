"use client";

import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import { useState } from "react";
import { useBulkAssignEmployeesOfficeLocation } from "../hooks/use-bulk-assign-employees-office-location";
import {
  OfficeLocation,
  OfficeLocationEmployee,
} from "../schemas/office-location-schema";
import { getOfficeLocationById } from "../services/office-location-service";

interface Props {
  officeLocation: OfficeLocation;
}

export function AssignEmployeesOfficeLocationModal({
  officeLocation,
}: Props) {
  const [open, setOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [selectionUpdated, setSelectionUpdated] = useState(false);
  const [employeeCache, setEmployeeCache] = useState<
    Record<string, OfficeLocationEmployee>
  >({});

  const {
    data: employeesData,
    isLoading: employeesLoading,
    isError: employeesError,
  } = useGetEmployees({
    key: employeeSearch,
    page: 1,
    size: 200,
  });

  const {
    data: detailData,
    isLoading: detailLoading,
    isError: detailError,
  } = useQuery({
    queryKey: ["office-locations", officeLocation.id],
    queryFn: () => getOfficeLocationById(officeLocation.id),
    enabled: open,
  });

  const mutation = useBulkAssignEmployeesOfficeLocation();
  const assignedEmployees = detailData?.data?.employees ?? [];
  const initialAssignedEmployees =
    detailData?.data?.employees ?? officeLocation.employees ?? [];
  const selectedEmployees = selectionUpdated
    ? selected
    : initialAssignedEmployees.map((employee) => employee.id);
  const employeeLookup = {
    ...Object.fromEntries(
      initialAssignedEmployees.map((employee) => [employee.id, employee]),
    ),
    ...employeeCache,
    ...Object.fromEntries(
      (employeesData?.data ?? []).map((employee) => [
        employee.id,
        {
          id: employee.id,
          fullname: employee.fullname,
          employee_number: employee.employee_number,
        },
      ]),
    ),
  };

  const toggle = (employee: OfficeLocationEmployee) => {
    setEmployeeCache((previous) => ({ ...previous, [employee.id]: employee }));
    setSelectionUpdated(true);
    setSelected(
      selectedEmployees.includes(employee.id)
        ? selectedEmployees.filter((id) => id !== employee.id)
        : [...selectedEmployees, employee.id],
    );
  };

  const handleSubmit = () => {
    mutation.mutate(
      { officeLocationId: officeLocation.id, employeeIds: selectedEmployees },
      { onSuccess: () => setOpen(false) },
    );
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setEmployeeSearch("");
      setSelected([]);
      setSelectionUpdated(false);
      setEmployeeCache({});
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={`Atur karyawan untuk ${officeLocation.name}`}
        onClick={() => {
          setSelected([]);
          setSelectionUpdated(false);
          setEmployeeCache({});
          setOpen(true);
        }}
      >
        <Users />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Assign Karyawan</DialogTitle>
            <DialogDescription>
              Cari karyawan, pilih siapa saja yang ditugaskan ke{" "}
              <span className="font-medium text-foreground">
                {officeLocation.name}
              </span>
              . Pilihan tersimpan sebagai daftar assign lokasi ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={employeeSearch}
                onChange={(event) => setEmployeeSearch(event.target.value)}
                placeholder="Cari nama atau nomor karyawan..."
                aria-label="Cari karyawan"
                className="pl-9"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sudah ditugaskan</span>
              </div>
              <span className="text-sm font-semibold">
                {detailLoading ? "…" : assignedEmployees.length}
              </span>
            </div>

            {detailLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : detailError ? (
              <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
                Gagal memuat daftar karyawan yang sudah ditugaskan.
              </p>
            ) : (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">
                  Rekap karyawan ter-assign
                </h3>
                {assignedEmployees.length === 0 ? (
                  <p className="rounded-xl border p-3 text-sm text-muted-foreground">
                    Belum ada karyawan yang ditugaskan.
                  </p>
                ) : (
                  <div className="max-h-36 space-y-2 overflow-y-auto rounded-xl border p-3">
                    {assignedEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="truncate font-medium">
                          {employee.fullname}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {employee.employee_number}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="space-y-2">
              <h3 className="text-sm font-medium">
                Pilih karyawan ({selectedEmployees.length} dipilih)
              </h3>
              {employeesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : employeesError ? (
                <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
                  Karyawan gagal dimuat. Coba ubah pencarian atau buka kembali
                  dialog.
                </p>
              ) : employeesData?.data.length ? (
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border p-2">
                  {employeesData.data.map((employee) => {
                    const option = {
                      id: employee.id,
                      fullname: employee.fullname,
                      employee_number: employee.employee_number,
                    };

                    return (
                      <label
                        key={employee.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted"
                      >
                        <Checkbox
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={() => toggle(option)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {employee.fullname}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {employee.employee_number}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl border p-4 text-center text-sm text-muted-foreground">
                  Tidak ada karyawan yang cocok dengan pencarian.
                </p>
              )}
            </section>

            {selectedEmployees.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">
                  Rekap pilihan ({selectedEmployees.length})
                </h3>
                <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                  {selectedEmployees.map((id) => {
                    const employee = employeeLookup[id];
                    return (
                      <span
                        key={id}
                        className="rounded-full border bg-muted/50 px-3 py-1 text-xs"
                      >
                        {employee?.fullname ?? employee?.employee_number ?? id}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                mutation.isPending || detailLoading || detailError || employeesError
              }
            >
              {mutation.isPending ? "Menyimpan..." : "Simpan Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
