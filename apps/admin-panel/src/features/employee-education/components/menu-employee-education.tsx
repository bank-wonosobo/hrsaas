"use client";

import { CreateEmployeeEducationForm } from "./create-employee-education";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  employeeId: string;
}

export default function MenuEmployeeEducation({ employeeId }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Riwayat Pendidikan</CardTitle></CardHeader>
      <CardContent className="flex justify-end">
      <CreateEmployeeEducationForm employeeId={employeeId} />
      </CardContent>
    </Card>
  );
}
