"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetAllTimeOffType } from "@/features/time-off-type/hooks/use-getall-time-off-type";
import { mapToOptions } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import FormTimeOffBalance from "./form-time-off-balance";

interface Props {
  employeeId: string;
  onFilterChange: (timeOffTypeId: string, periodYear: number) => void;
  timeOffTypeId: string;
  periodYear: number;
}

export default function MenuTimeOffBalance({
  employeeId,
  onFilterChange,
  timeOffTypeId,
  periodYear,
}: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: timeOffTypes, isLoading: areTypesLoading, isError: typesError } = useGetAllTimeOffType();

  const typeOptions = mapToOptions(timeOffTypes ?? [], (t) => t.name, (t) => t.id);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 2 + i;
    return { label: String(year), value: String(year) };
  });

  return (
    <>
      <FormTimeOffBalance
        employeeId={employeeId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select value={timeOffTypeId || "all"} onValueChange={(val) => onFilterChange(val === "all" ? "" : val, periodYear)} disabled={areTypesLoading || !!typesError}>
              <SelectTrigger className="w-full" aria-label="Jenis cuti"><SelectValue placeholder="Jenis cuti" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {typeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Select value={String(periodYear)} onValueChange={(val) => onFilterChange(timeOffTypeId, Number(val))}>
              <SelectTrigger className="w-full" aria-label="Tahun"><SelectValue /></SelectTrigger>
              <SelectContent>{yearOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        {typesError && <p role="alert" className="text-sm text-destructive">Jenis cuti gagal dimuat. Coba muat ulang halaman.</p>}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFormOpen(true)}
        >
          <PlusCircle size={16} /> Tambah Saldo
        </Button>
        </CardContent>
      </Card>
    </>
  );
}
