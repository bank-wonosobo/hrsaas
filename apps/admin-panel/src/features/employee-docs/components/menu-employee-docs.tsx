"use client";

import { CreateEmployeeDocsForm } from "./create-employee-docs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  employeeId: string;
}

export default function MenuEmployeeDocs({ employeeId }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Dokumen Karyawan</CardTitle></CardHeader>
      <CardContent className="flex justify-end">
      <CreateEmployeeDocsForm employeeId={employeeId} />
      </CardContent>
    </Card>
  );
}
