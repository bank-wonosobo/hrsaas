"use client";

import Button from "@/components/ui/button/button";
import Select from "@/components/ui/select/select";
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

  const { data: timeOffTypes } = useGetAllTimeOffType();

  const typeOptions = [
    { label: "Semua Jenis", value: "" },
    ...mapToOptions(
      timeOffTypes ?? [],
      (t) => t.name,
      (t) => t.id,
    ),
  ];

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select
              label="Jenis Cuti"
              options={typeOptions}
              value={timeOffTypeId}
              onChange={(val) => onFilterChange(val, periodYear)}
            />
          </div>
          <div className="w-36">
            <Select
              label="Tahun"
              options={yearOptions}
              value={String(periodYear)}
              onChange={(val) => onFilterChange(timeOffTypeId, Number(val))}
            />
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          prefixIcon={<PlusCircle size={16} />}
          onClick={() => setIsFormOpen(true)}
        >
          Tambah Saldo
        </Button>
      </div>
    </>
  );
}
