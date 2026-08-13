"use client";

import ListEmployeeEducation from "@/features/employee-education/components/list-employee-education";
import MenuEmployeeEducation from "@/features/employee-education/components/menu-employee-education";
import { use } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EmployeeEducationPage({ params }: Props) {
  const { id } = use(params);
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const size = Number(searchParams.get("size") ?? 10);

  return (
    <div className="border p-4 rounded-2xl space-y-4">
      <MenuEmployeeEducation employeeId={id} />
      <ListEmployeeEducation
        search={{
          employee_id: id,
          page,
          size,
        }}
      />
    </div>
  );
}
