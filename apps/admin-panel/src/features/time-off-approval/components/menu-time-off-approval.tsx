"use client";

import { DateRange } from "@/components/shared/date-range-picker/date-range-picker";
import InputDateRange from "@/components/ui/input-date-range/input-date-range";
import SelectSearch from "@/components/ui/select-search/select-search";
import Select from "@/components/ui/select/select";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { useGetAllTimeOffType } from "@/features/time-off-type/hooks/use-getall-time-off-type";
import { mapToOptions } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { CalendarDays, ChevronDown, Filter, RotateCcw, User, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchTimeOffApproval } from "../schemas/time-off-approval-schema";

const APPROVAL_STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Ditolak", value: "REJECTED" },
];

const REQUEST_STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Ditolak", value: "REJECTED" },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

interface Props {
  search: SearchTimeOffApproval;
}

export default function MenuTimeOffApproval({ search }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [employeeID, setEmployeeID] = useState(search.employee_id ?? "");
  const [typeID, setTypeID] = useState(search.time_off_type_id ?? "");
  const [status, setStatus] = useState(search.status ?? "");
  const [requestStatus, setRequestStatus] = useState(
    search.request_status ?? "",
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    start: search.start_date ? parseISO(search.start_date) : null,
    end: search.end_date ? parseISO(search.end_date) : null,
  });

  const { data: employees } = useGetEmployees({ size: 500 });
  const employeeOptions = mapToOptions(
    employees?.data ?? [],
    (e) => e.fullname,
    (e) => e.id,
  );

  const { data: timeOffTypes } = useGetAllTimeOffType();
  const typeOptions = mapToOptions(
    timeOffTypes ?? [],
    (t) => t.name,
    (t) => t.id,
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

  function handleType(val: string) {
    setTypeID(val);
    updateQuery({ time_off_type_id: val || null });
  }

  function handleStatus(val: string) {
    setStatus(val);
    updateQuery({ status: val || null });
  }

  function handleRequestStatus(val: string) {
    setRequestStatus(val);
    updateQuery({ request_status: val || null });
  }

  function handleDateRange(range: DateRange) {
    setDateRange(range);
    updateQuery({
      start_date: range.start ? format(range.start, "yyyy-MM-dd") : null,
      end_date: range.end ? format(range.end, "yyyy-MM-dd") : null,
    });
  }

  function handleReset() {
    setEmployeeID("");
    setTypeID("");
    setStatus("");
    setRequestStatus("");
    setDateRange({ start: null, end: null });
    router.push("?page=1&size=10", { scroll: false });
  }

  // Build active filter chips
  const activeFilters: { key: string; label: string; onRemove: () => void }[] =
    [];

  if (employeeID) {
    const name =
      employeeOptions.find((o) => o.value === employeeID)?.label ?? employeeID;
    activeFilters.push({
      key: "employee",
      label: name,
      onRemove: () => handleEmployee(""),
    });
  }
  if (typeID) {
    const name =
      typeOptions.find((o) => o.value === typeID)?.label ?? typeID;
    activeFilters.push({
      key: "type",
      label: name,
      onRemove: () => handleType(""),
    });
  }
  if (status) {
    const name =
      APPROVAL_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
    activeFilters.push({
      key: "status",
      label: `Approval: ${name}`,
      onRemove: () => handleStatus(""),
    });
  }
  if (requestStatus) {
    const name =
      REQUEST_STATUS_OPTIONS.find((o) => o.value === requestStatus)?.label ??
      requestStatus;
    activeFilters.push({
      key: "request_status",
      label: `Pengajuan: ${name}`,
      onRemove: () => handleRequestStatus(""),
    });
  }
  if (dateRange.start && dateRange.end) {
    activeFilters.push({
      key: "date",
      label: `${format(dateRange.start, "dd MMM yyyy")} – ${format(dateRange.end, "dd MMM yyyy")}`,
      onRemove: () => handleDateRange({ start: null, end: null }),
    });
  }

  const hasFilters = activeFilters.length > 0;

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

      {/* Header – clickable toggle */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen((prev) => !prev); }}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
            <Filter className="h-4 w-4 text-zinc-600" />
          </div>
          <span className="font-semibold text-zinc-800">Filter</span>
          {hasFilters && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-bold text-white">
              {activeFilters.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasFilters && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); handleReset(); } }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Collapsible body */}
      {open && (
        <div className="border-t border-zinc-100">
          {/* Fields */}
          <div className="px-5 pt-4 pb-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  <User className="h-3 w-3" />
                  Karyawan
                </label>
                <SelectSearch
                  label="Pilih karyawan"
                  options={employeeOptions}
                  value={employeeID}
                  onChange={handleEmployee}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  <CalendarDays className="h-3 w-3" />
                  Jenis Cuti
                </label>
                <SelectSearch
                  label="Pilih jenis cuti"
                  options={typeOptions}
                  value={typeID}
                  onChange={handleType}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  Status Approval
                </label>
                <Select
                  label="Pilih status"
                  options={APPROVAL_STATUS_OPTIONS}
                  value={status}
                  onChange={handleStatus}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  Status Pengajuan
                </label>
                <Select
                  label="Pilih status"
                  options={REQUEST_STATUS_OPTIONS}
                  value={requestStatus}
                  onChange={handleRequestStatus}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                <CalendarDays className="h-3 w-3" />
                Rentang Tanggal
              </label>
              <InputDateRange
                labelStart="Tanggal mulai"
                labelEnd="Tanggal selesai"
                value={dateRange}
                onChange={handleDateRange}
              />
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 border-t border-zinc-100 px-5 py-3 bg-zinc-50">
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                    STATUS_COLOR[
                      f.key === "status"
                        ? status
                        : f.key === "request_status"
                          ? requestStatus
                          : ""
                    ] ?? "bg-zinc-100 text-zinc-700 border-zinc-200"
                  }`}
                >
                  {f.label}
                  <button
                    onClick={f.onRemove}
                    className="rounded-full opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
