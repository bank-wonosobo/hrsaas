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
import type React from "react";
import { useState } from "react";
import { SearchAttendanceRequest } from "../schemas/attendance-schema";

const STATUS_OPTIONS = [
  { label: "Hadir", value: "HADIR" },
  { label: "Terlambat", value: "TERLAMBAT" },
  { label: "Tidak Hadir", value: "TIDAK_HADIR" },
];

interface Props {
  search: SearchAttendanceRequest;
  exportAction: React.ReactNode;
}

function getTodayInJakarta() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

export default function MenuAttendance({ search, exportAction }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [employeeID, setEmployeeID] = useState(search.employee_id ?? "");
  const [status, setStatus] = useState(search.status ?? "");
  const [dateRange, setDateRange] = useState({
    start: search.start_date ? parseISO(search.start_date) : null,
    end: search.end_date ? parseISO(search.end_date) : null,
  });

  const { data: employees } = useGetEmployees({ size: 500 });
  const employeeOptions = mapToOptions(
    employees?.data ?? [],
    (employee) => employee.fullname,
    (employee) => employee.id,
  );

  function updateQuery(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    params.set("page", "1");
    params.set("size", search.size?.toString() ?? "10");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function handleEmployee(value: string) {
    const nextValue = value === "all" ? "" : value;
    setEmployeeID(nextValue);
    updateQuery({ employee_id: nextValue || null });
  }

  function handleStatus(value: string) {
    const nextValue = value === "all" ? "" : value;
    setStatus(nextValue);
    updateQuery({ status: nextValue || null });
  }

  function handleDateChange(field: "start" | "end", value: string) {
    const nextValue = value ? parseISO(value) : null;
    const nextRange = { ...dateRange, [field]: nextValue };
    setDateRange(nextRange);
    updateQuery({
      start_date: nextRange.start
        ? format(nextRange.start, "yyyy-MM-dd")
        : null,
      end_date: nextRange.end ? format(nextRange.end, "yyyy-MM-dd") : null,
    });
  }

  function handleReset() {
    const today = getTodayInJakarta();
    const todayDate = parseISO(today);
    setEmployeeID("");
    setStatus("");
    setDateRange({ start: todayDate, end: todayDate });
    router.push(
      `?page=1&size=${search.size ?? 10}&start_date=${today}&end_date=${today}`,
      { scroll: false },
    );
  }

  const activeFilters: { key: string; label: string; onRemove: () => void }[] =
    [];
  if (employeeID) {
    activeFilters.push({
      key: "employee",
      label:
        employeeOptions.find((option) => option.value === employeeID)?.label ??
        employeeID,
      onRemove: () => handleEmployee("all"),
    });
  }
  if (status) {
    activeFilters.push({
      key: "status",
      label:
        STATUS_OPTIONS.find((option) => option.value === status)?.label ??
        status,
      onRemove: () => handleStatus("all"),
    });
  }
  if (dateRange.start && dateRange.end) {
    const today = getTodayInJakarta();
    activeFilters.push({
      key: "date",
      label:
        format(dateRange.start, "yyyy-MM-dd") === today &&
        format(dateRange.end, "yyyy-MM-dd") === today
          ? "Hari ini"
          : `${format(dateRange.start, "dd MMM yyyy")} – ${format(dateRange.end, "dd MMM yyyy")}`,
      onRemove: handleReset,
    });
  }

  return (
    <Card className="mb-5 gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
            <Filter className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">Filter kehadiran</p>
            <p className="text-xs text-muted-foreground">
              Saring data berdasarkan karyawan, status, dan tanggal.
            </p>
          </div>
          {activeFilters.length > 0 && (
            <Badge variant="secondary">{activeFilters.length}</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.length > 0 && (
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
          {exportAction}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label
              htmlFor="attendance-employee"
              className="flex items-center gap-2"
            >
              <User className="size-4 text-muted-foreground" />
              Karyawan
            </Label>
            <Select value={employeeID || "all"} onValueChange={handleEmployee}>
              <SelectTrigger id="attendance-employee" className="w-full">
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
            <Label htmlFor="attendance-status">Status</Label>
            <Select value={status || "all"} onValueChange={handleStatus}>
              <SelectTrigger id="attendance-status" className="w-full">
                <SelectValue placeholder="Semua status" />
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

          <div className="space-y-2">
            <Label htmlFor="attendance-start-date">Dari tanggal</Label>
            <Input
              id="attendance-start-date"
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
            <Label htmlFor="attendance-end-date">Sampai tanggal</Label>
            <Input
              id="attendance-end-date"
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
