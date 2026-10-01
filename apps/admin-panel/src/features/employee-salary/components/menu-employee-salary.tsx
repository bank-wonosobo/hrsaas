"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import FormEmployeeSalary from "./form-employee-salary";

interface Props {
  employeeId: string;
}

export default function MenuEmployeeSalary({ employeeId }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <FormEmployeeSalary
        employeeId={employeeId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
      <Card className="bg-secondary shadow-none">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Riwayat Gaji Pokok</CardTitle>
          <CardAction>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsFormOpen(true)}
            >
              <PlusCircle />
              Tambah Gaji
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    </>
  );
}
