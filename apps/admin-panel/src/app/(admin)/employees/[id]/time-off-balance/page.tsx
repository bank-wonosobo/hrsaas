"use client";

import ListTimeOffBalance from "@/features/time-off-balance/components/list-time-off-balance";
import MenuTimeOffBalance from "@/features/time-off-balance/components/menu-time-off-balance";
import { use, useState } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EmployeeTimeOffPage({ params }: Props) {
  const { id } = use(params);
  const currentYear = new Date().getFullYear();

  const [timeOffTypeId, setTimeOffTypeId] = useState("");
  const [periodYear, setPeriodYear] = useState(currentYear);

  function handleFilterChange(typeId: string, year: number) {
    setTimeOffTypeId(typeId);
    setPeriodYear(year);
  }

  return (
    <div className="border p-4 rounded-2xl space-y-4">
      <MenuTimeOffBalance
        employeeId={id}
        onFilterChange={handleFilterChange}
        timeOffTypeId={timeOffTypeId}
        periodYear={periodYear}
      />
      <ListTimeOffBalance
        employeeId={id}
        search={{
          time_off_type_id: timeOffTypeId || undefined,
          period_year: periodYear,
        }}
      />
    </div>
  );
}
