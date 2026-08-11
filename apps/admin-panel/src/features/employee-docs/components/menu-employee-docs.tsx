"use client";

import { CreateEmployeeDocsForm } from "./create-employee-docs";

interface Props {
  employeeId: string;
}

export default function MenuEmployeeDocs({ employeeId }: Props) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-semibold text-gray-700">Dokumen Karyawan</p>
      <CreateEmployeeDocsForm employeeId={employeeId} />
    </div>
  );
}
