"use client";

import SelectSearch from "@/components/ui/select-search/select-search";
import Select from "@/components/ui/select/select";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { mapToOptions } from "@/lib/utils";
import { CalendarDays, ChevronDown, Filter, List, RotateCcw, User, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchTimeOffRequest } from "../schemas/time-off-schema";
import { CreateTimeOffForm } from "./create-time-off";

const STATUS_OPTIONS = [
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
  search: SearchTimeOffRequest;
  view: string;
}

export default function MenuTimeOffRequest({ search, view }: Props): React.ReactNode {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [employeeID, setEmployeeID] = useState(search.employee_id ?? "");
  const [status, setStatus] = useState(search.request_status ?? "");

  const { data: employees } = useGetEmployees({ size: 500 });
  const employeeOptions = mapToOptions(employees?.data ?? [], (e) => e.fullname, (e) => e.id);

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

  function handleEmployee(val: string) { setEmployeeID(val); updateQuery({ employee_id: val || null }); }
  function handleStatus(val: string) { setStatus(val); updateQuery({ request_status: val || null }); }

  function handleReset() {
    setEmployeeID(""); setStatus("");
    router.push("?page=1&size=10", { scroll: false });
  }

  function setView(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  const activeFilters: { key: string; label: string; onRemove: () => void }[] = [];
  if (employeeID) activeFilters.push({ key: "employee", label: employeeOptions.find((o) => o.value === employeeID)?.label ?? employeeID, onRemove: () => handleEmployee("") });
  if (status) activeFilters.push({ key: "status", label: STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status, onRemove: () => handleStatus("") });

  const hasFilters = activeFilters.length > 0;

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Top bar – view toggle + action (always visible) */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl">
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view !== "calendar" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            <List className="w-4 h-4" />
            Tabel
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "calendar" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            <CalendarDays className="w-4 h-4" />
            Kalender
          </button>
        </div>
        <CreateTimeOffForm />
      </div>

      {/* Filter header – collapsible toggle */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((p) => !p)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen((p) => !p); }}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-zinc-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100">
            <Filter className="h-3.5 w-3.5 text-zinc-600" />
          </div>
          <span className="text-sm font-semibold text-zinc-800">Filter</span>
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
          <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Collapsible filter body */}
      {open && (
        <div className="border-t border-zinc-100">
          <div className="px-5 pt-4 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  <User className="h-3 w-3" />
                  Karyawan
                </label>
                <SelectSearch label="Pilih karyawan" options={employeeOptions} value={employeeID} onChange={handleEmployee} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  Status
                </label>
                <Select label="Pilih status" options={STATUS_OPTIONS} value={status} onChange={handleStatus} />
              </div>
            </div>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap gap-2 border-t border-zinc-100 px-5 py-3 bg-zinc-50">
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLOR[f.key === "status" ? status : ""] ?? "bg-zinc-100 text-zinc-700 border-zinc-200"}`}
                >
                  {f.label}
                  <button onClick={f.onRemove} className="rounded-full opacity-60 hover:opacity-100 transition-opacity">
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
