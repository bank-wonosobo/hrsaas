"use client";

import ListEmployeeTraining from "@/features/employee-training/components/list-employee-training";
import MenuEmployeeTraining from "@/features/employee-training/components/menu-employee-training";
import { use } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EmployeeTrainingPage({ params }: Props) {
  const { id } = use(params);
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const size = Number(searchParams.get("size") ?? 10);

  return (
    <div className="border p-4 rounded-2xl space-y-4">
      <MenuEmployeeTraining employeeId={id} />
      <ListEmployeeTraining
        search={{
          employee_id: id,
          page,
          size,
        }}
      />
    </div>
  );
}
