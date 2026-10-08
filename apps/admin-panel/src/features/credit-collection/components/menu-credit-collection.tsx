"use client";

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
import { Filter, RotateCcw, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { SearchCreditCollectionRequest } from "../schemas/credit-collection-schema";

const ALL_EMPLOYEES = "__all_employees__";

interface Props {
  search: SearchCreditCollectionRequest;
}

const FILTER_FIELDS = [
  { name: "nasabah_name", label: "Nama Nasabah", type: "text" },
  { name: "no_pjm", label: "Nomor Pinjaman", type: "text" },
] as const;

export default function MenuCreditCollection({ search }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    data: employees,
    isLoading: employeesLoading,
    isError: employeesError,
  } = useGetEmployees({ page: 1, size: 500 });
  const [filters, setFilters] = useState({
    employee_id: search.employee_id ?? "",
    nasabah_name: search.nasabah_name ?? "",
    no_pjm: search.no_pjm ?? "",
    start_date: search.start_date ?? "",
    end_date: search.end_date ?? "",
  });

  function updateFilter(
    field: keyof typeof filters,
    value: string,
  ) {
    setFilters((previous) => ({ ...previous, [field]: value }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    params.set("size", search.size?.toString() ?? "10");

    router.push(`?${params.toString()}`, { scroll: false });
  }

  function resetFilters() {
    setFilters({
      employee_id: "",
      nasabah_name: "",
      no_pjm: "",
      start_date: "",
      end_date: "",
    });
    router.push(
      `?page=1&size=${search.size?.toString() ?? "10"}`,
      { scroll: false },
    );
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <Card className="mb-5 gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
            <Filter className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">Filter penagihan kredit</p>
            <p className="text-xs text-muted-foreground">
              Cari berdasarkan karyawan, nasabah, nomor pinjaman, dan tanggal.
            </p>
          </div>
        </div>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
          >
            <RotateCcw />
            Reset
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <form onSubmit={applyFilters} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="credit-collection-employee">Karyawan</Label>
              <Select
                value={filters.employee_id || ALL_EMPLOYEES}
                onValueChange={(value) =>
                  updateFilter(
                    "employee_id",
                    value === ALL_EMPLOYEES ? "" : value,
                  )
                }
                disabled={employeesLoading || employeesError}
              >
                <SelectTrigger
                  id="credit-collection-employee"
                  className="w-full"
                >
                  <SelectValue
                    placeholder={
                      employeesLoading
                        ? "Memuat karyawan..."
                        : employeesError
                          ? "Gagal memuat karyawan"
                          : "Pilih karyawan"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_EMPLOYEES}>Semua karyawan</SelectItem>
                  {filters.employee_id &&
                    !employees?.data.some(
                      (employee) => employee.id === filters.employee_id,
                    ) && (
                      <SelectItem value={filters.employee_id}>
                        {filters.employee_id}
                      </SelectItem>
                    )}
                  {(employees?.data ?? []).map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.fullname} · {employee.employee_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {employeesError && (
                <p className="text-sm text-destructive">
                  Daftar karyawan gagal dimuat. Coba muat ulang halaman.
                </p>
              )}
            </div>
            {FILTER_FIELDS.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={`credit-collection-${field.name}`}>
                  {field.label}
                </Label>
                <Input
                  id={`credit-collection-${field.name}`}
                  type={field.type}
                  value={filters[field.name]}
                  onChange={(event) =>
                    updateFilter(field.name, event.target.value)
                  }
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="credit-collection-start-date">Dari tanggal</Label>
              <Input
                id="credit-collection-start-date"
                type="date"
                value={filters.start_date}
                max={filters.end_date || undefined}
                onChange={(event) =>
                  updateFilter("start_date", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-collection-end-date">
                Sampai tanggal
              </Label>
              <Input
                id="credit-collection-end-date"
                type="date"
                value={filters.end_date}
                min={filters.start_date || undefined}
                onChange={(event) =>
                  updateFilter("end_date", event.target.value)
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              <Search />
              Terapkan filter
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
