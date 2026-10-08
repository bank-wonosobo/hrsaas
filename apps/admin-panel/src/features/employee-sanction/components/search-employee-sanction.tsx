"use client";

import { DateRange } from "@/components/shared/date-range-picker/date-range-picker";
import InputDateRange from "@/components/ui/input-date-range/input-date-range";
import SelectSearch from "@/components/ui/select-search/select-search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { mapToOptions } from "@/lib/utils";
import { CalendarDays, ChevronDown, Filter, RotateCcw, User, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useGetSanctionTypes } from "../hooks/use-get-sanction-types";
import { SearchEmployeeSanctionRequest } from "../schemas/employee-sanction-schema";
import { CreateEmployeeSanctionForm } from "./create-employee-sanction";

const STATUS_OPTIONS = [
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

interface Props {
  search: SearchEmployeeSanctionRequest;
}

export default function SearchEmployeeSanction({ search }: Props): React.ReactNode {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [employeeID, setEmployeeID] = useState(search.employee_id ?? "");
  const [sanctionID, setSanctionID] = useState(search.sanction_id ?? "");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: search.start_date ? parseISO(search.start_date) : null,
    end: search.end_date ? parseISO(search.end_date) : null,
  });
  const [status, setStatus] = useState(
    search.status === true ? "active" : search.status === false ? "inactive" : "",
  );

  const { data: employees } = useGetEmployees({ size: 500 });
  const employeeOptions = mapToOptions(employees?.data ?? [], (e) => e.fullname, (e) => e.id);

  const { data: sanctionTypes } = useGetSanctionTypes();
  const sanctionOptions = mapToOptions(sanctionTypes?.data ?? [], (s) => s.name, (s) => s.id);

  function updateQuery(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function handleEmployee(val: string) { setEmployeeID(val); updateQuery({ employee_id: val || null }); }
  function handleSanction(val: string) { setSanctionID(val); updateQuery({ sanction_id: val || null }); }
  function handleStatus(val: string) { setStatus(val); updateQuery({ status: val || null }); }
  function handleDateRange(range: DateRange) {
    setDateRange(range);
    updateQuery({
      start_date: range.start ? format(range.start, "yyyy-MM-dd") : null,
      end_date: range.end ? format(range.end, "yyyy-MM-dd") : null,
    });
  }

  function handleReset() {
    setEmployeeID(""); setSanctionID(""); setStatus(""); setDateRange({ start: null, end: null });
    router.push("?page=1&size=10", { scroll: false });
  }

  const activeFilters: { key: string; label: string; onRemove: () => void }[] = [];
  if (employeeID) activeFilters.push({ key: "employee", label: employeeOptions.find((o) => o.value === employeeID)?.label ?? employeeID, onRemove: () => handleEmployee("") });
  if (sanctionID) activeFilters.push({ key: "sanction", label: sanctionOptions.find((o) => o.value === sanctionID)?.label ?? sanctionID, onRemove: () => handleSanction("") });
  if (status) activeFilters.push({ key: "status", label: STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status, onRemove: () => handleStatus("") });
  if (dateRange.start && dateRange.end) activeFilters.push({ key: "date", label: `${format(dateRange.start, "dd MMM yyyy")} – ${format(dateRange.end, "dd MMM yyyy")}`, onRemove: () => handleDateRange({ start: null, end: null }) });

  const hasFilters = activeFilters.length > 0;

  return (
    <Card className="mb-5 gap-0 py-0">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            className="justify-start px-0 hover:bg-transparent"
            aria-expanded={open}
            onClick={() => setOpen((previous) => !previous)}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Filter className="size-4" />
            </span>
            Filter
            {hasFilters && (
              <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFilters.length}
              </span>
            )}
            <ChevronDown
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </Button>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw />
                Reset
              </Button>
            )}
            <CreateEmployeeSanctionForm />
          </div>
        </div>

        {open && (
          <div className="space-y-4 border-t px-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <User className="size-4 text-muted-foreground" />
                  Karyawan
                </label>
                <SelectSearch
                  label="Pilih karyawan"
                  options={employeeOptions}
                  value={employeeID}
                  onChange={handleEmployee}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jenis Sanksi</label>
                <SelectSearch
                  label="Pilih jenis sanksi"
                  options={sanctionOptions}
                  value={sanctionID}
                  onChange={handleSanction}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <ShadcnSelect value={status} onValueChange={handleStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </ShadcnSelect>
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="size-4 text-muted-foreground" />
                Rentang Tanggal
              </label>
              <InputDateRange
                labelStart="Tanggal mulai"
                labelEnd="Tanggal selesai"
                value={dateRange}
                onChange={handleDateRange}
              />
            </div>

            {hasFilters && (
              <div className="flex flex-wrap gap-2 border-t pt-3">
                {activeFilters.map((filter) => (
                  <Badge key={filter.key} variant="secondary" className="gap-1.5">
                    {filter.label}
                    <button
                      type="button"
                      aria-label={`Hapus filter ${filter.label}`}
                      onClick={filter.onRemove}
                    >
                      <X className="size-3" />
                    </button>
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
