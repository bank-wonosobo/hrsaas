"use client";

import { CreateEmployeeEducationForm } from "./create-employee-education";

interface Props {
  employeeId: string;
}

export default function MenuEmployeeEducation({ employeeId }: Props) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-semibold text-gray-700">Riwayat Pendidikan</p>
      <CreateEmployeeEducationForm employeeId={employeeId} />
    </div>
  );
}
