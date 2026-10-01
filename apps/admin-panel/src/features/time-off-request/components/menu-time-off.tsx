"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { mapToOptions } from "@/lib/utils";
import { CalendarDays, Filter, List, RotateCcw, User, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchTimeOffRequest } from "../schemas/time-off-schema";
import { CreateTimeOffForm } from "./create-time-off";

const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Ditolak", value: "REJECTED" },
];

interface Props {
  search: SearchTimeOffRequest;
  view: string;
}

export default function MenuTimeOffRequest({
  search,
  view,
}: Props): React.ReactNode {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [employeeID, setEmployeeID] = useState(search.employee_id ?? "");
  const [status, setStatus] = useState(search.request_status ?? "");

  const { data: employees } = useGetEmployees({ size: 500 });
  const employeeOptions = mapToOptions(
    employees?.data ?? [],
    (e) => e.fullname,
    (e) => e.id,
  );

  function updateQuery(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    params.set("page", "1");
    params.set("size", "10");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function handleEmployee(val: string) {
    setEmployeeID(val);
    updateQuery({ employee_id: val || null });
  }
  function handleStatus(val: string) {
    setStatus(val);
    updateQuery({ request_status: val || null });
  }

  function handleReset() {
    setEmployeeID("");
    setStatus("");
    router.push("?page=1&size=10", { scroll: false });
  }

  function setView(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  const activeFilters: { key: string; label: string; onRemove: () => void }[] =
    [];
  if (employeeID)
    activeFilters.push({
      key: "employee",
      label:
        employeeOptions.find((o) => o.value === employeeID)?.label ??
        employeeID,
      onRemove: () => handleEmployee(""),
    });
  if (status)
    activeFilters.push({
      key: "status",
      label: STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status,
      onRemove: () => handleStatus(""),
    });

  const hasFilters = activeFilters.length > 0;

  return (
    <Card className="mb-5 gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b p-4 sm:px-5">
        <ToggleGroup
          type="single"
          value={view === "calendar" ? "calendar" : "table"}
          onValueChange={(value) => value && setView(value)}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Tampilan pengajuan cuti"
        >
          <ToggleGroupItem value="table" aria-label="Tampilan tabel">
            <List />
            <span className="hidden sm:inline">Tabel</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="calendar" aria-label="Tampilan kalender">
            <CalendarDays />
            <span className="hidden sm:inline">Kalender</span>
          </ToggleGroupItem>
        </ToggleGroup>
        <CreateTimeOffForm />
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              aria-expanded={open}
              onClick={() => setOpen((previous) => !previous)}
              className="justify-start px-2"
            >
              <Filter className="size-4" />
              Filter
            </Button>
            {hasFilters && (
              <Badge variant="secondary">{activeFilters.length}</Badge>
            )}
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw />
              Reset
            </Button>
          )}
        </div>

        {open && (
          <div className="space-y-4 border-t p-4 sm:px-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  Karyawan
                </Label>
                <Select
                  value={employeeID || "all"}
                  onValueChange={(value) =>
                    handleEmployee(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger id="time-off-employee" className="w-full">
                    <SelectValue placeholder="Pilih karyawan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua karyawan</SelectItem>
                    {employeeOptions.map((employee) => (
                      <SelectItem key={employee.value} value={employee.value}>
                        {employee.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-off-status">Status</Label>
                <Select
                  value={status || "all"}
                  onValueChange={(value) =>
                    handleStatus(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger id="time-off-status" className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua status</SelectItem>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasFilters && (
              <div className="flex flex-wrap gap-2 border-t pt-4">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.key}
                    variant={
                      filter.key === "status" && status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                    }
                    className="gap-1.5 py-1 pr-1"
                  >
                    {filter.label}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Hapus filter ${filter.label}`}
                      onClick={filter.onRemove}
                      className="rounded-full"
                    >
                      <X />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
