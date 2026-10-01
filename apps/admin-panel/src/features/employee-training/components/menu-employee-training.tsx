"use client";

import { CreateEmployeeTrainingForm } from "./create-employee-training";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  employeeId: string;
}

export default function MenuEmployeeTraining({ employeeId }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Riwayat Pelatihan</CardTitle></CardHeader>
      <CardContent className="flex justify-end">
      <CreateEmployeeTrainingForm employeeId={employeeId} />
      </CardContent>
    </Card>
  );
}
