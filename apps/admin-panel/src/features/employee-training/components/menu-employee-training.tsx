"use client";

import { CreateEmployeeTrainingForm } from "./create-employee-training";

interface Props {
  employeeId: string;
}

export default function MenuEmployeeTraining({ employeeId }: Props) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-semibold text-gray-700">Riwayat Pelatihan</p>
      <CreateEmployeeTrainingForm employeeId={employeeId} />
    </div>
  );
}
