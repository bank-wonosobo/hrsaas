"use client";

import ListEmployeeDocs from "@/features/employee-docs/components/list-employee-docs";
import MenuEmployeeDocs from "@/features/employee-docs/components/menu-employee-docs";
import { use } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EmployeeDocsPage({ params }: Props) {
  const { id } = use(params);
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const size = Number(searchParams.get("size") ?? 10);

  return (
    <div className="border p-4 rounded-2xl space-y-4">
      <MenuEmployeeDocs employeeId={id} />
      <ListEmployeeDocs
        search={{
          employee_id: id,
          page,
          size,
        }}
      />
    </div>
  );
}
