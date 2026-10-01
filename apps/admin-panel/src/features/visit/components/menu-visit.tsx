"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { mapToOptions } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Filter, RotateCcw, User, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchVisitRequest } from "../schemas/visit-schema";

const SORT_OPTIONS = [
  { label: "Terbaru", value: "newest" },
  { label: "Terlama", value: "oldest" },
];

interface Props {
  search: SearchVisitRequest;
}

export default function MenuVisit({ search }: Props): React.ReactNode {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [employeeID, setEmployeeID] = useState(search.employee_id ?? "");
  const [dateRange, setDateRange] = useState({
    start: search.start_date ? parseISO(search.start_date) : null,
    end: search.end_date ? parseISO(search.end_date) : null,
  });
  const [sortBy, setSortBy] = useState(search.sort_by ?? "");

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
    const nextValue = val === "all" ? "" : val;
    setEmployeeID(nextValue);
    updateQuery({ employee_id: nextValue || null });
  }

  function handleDateChange(field: "start" | "end", value: string) {
    const nextRange = { ...dateRange, [field]: value ? parseISO(value) : null };
    setDateRange(nextRange);
    updateQuery({
      start_date: nextRange.start
        ? format(nextRange.start, "yyyy-MM-dd")
        : null,
      end_date: nextRange.end ? format(nextRange.end, "yyyy-MM-dd") : null,
    });
  }

  function clearDateRange() {
    setDateRange({ start: null, end: null });
    updateQuery({ start_date: null, end_date: null });
  }

  function handleSortBy(val: string) {
    setSortBy(val);
    updateQuery({ sort_by: val || null });
  }

  function handleReset() {
    setEmployeeID("");
    setDateRange({ start: null, end: null });
    setSortBy("");
    router.push("?page=1&size=10", { scroll: false });
  }

  const activeFilters: { key: string; label: string; onRemove: () => void }[] =
    [];
  if (employeeID) {
    activeFilters.push({
      key: "employee",
      label:
        employeeOptions.find((o) => o.value === employeeID)?.label ??
        employeeID,
      onRemove: () => handleEmployee(""),
    });
  }
  if (dateRange.start && dateRange.end) {
    activeFilters.push({
      key: "date",
      label: `${format(dateRange.start, "dd MMM yyyy")} – ${format(dateRange.end, "dd MMM yyyy")}`,
      onRemove: clearDateRange,
    });
  }
  if (sortBy) {
    activeFilters.push({
      key: "sort",
      label: SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? sortBy,
      onRemove: () => handleSortBy(""),
    });
  }

  return (
    <Card className="mb-5 gap-0 py-0 shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
            <Filter className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">Filter kunjungan</p>
            <p className="text-xs text-muted-foreground">
              Saring data berdasarkan karyawan dan tanggal.
            </p>
          </div>
          {activeFilters.length > 0 && (
            <Badge variant="secondary">{activeFilters.length}</Badge>
          )}
        </div>

        {activeFilters.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw />
            Reset
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="visit-employee" className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              Karyawan
            </Label>
            <Select value={employeeID || "all"} onValueChange={handleEmployee}>
              <SelectTrigger id="visit-employee" className="w-full">
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
            <Label htmlFor="visit-sort">Urutkan</Label>
            <Select value={sortBy || "newest"} onValueChange={handleSortBy}>
              <SelectTrigger id="visit-sort" className="w-full">
                <SelectValue placeholder="Pilih urutan" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit-start-date">Dari tanggal</Label>
            <Input
              id="visit-start-date"
              type="date"
              value={
                dateRange.start ? format(dateRange.start, "yyyy-MM-dd") : ""
              }
              max={
                dateRange.end ? format(dateRange.end, "yyyy-MM-dd") : undefined
              }
              onChange={(event) =>
                handleDateChange("start", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit-end-date">Sampai tanggal</Label>
            <Input
              id="visit-end-date"
              type="date"
              value={dateRange.end ? format(dateRange.end, "yyyy-MM-dd") : ""}
              min={
                dateRange.start
                  ? format(dateRange.start, "yyyy-MM-dd")
                  : undefined
              }
              onChange={(event) => handleDateChange("end", event.target.value)}
            />
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
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
      </CardContent>
    </Card>
  );
}
