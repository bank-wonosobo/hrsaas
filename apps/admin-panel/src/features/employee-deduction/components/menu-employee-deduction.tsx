"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import FormEmployeeDeduction from "./form-employee-deduction";

interface Props {
  employeeId: string;
}

export default function MenuEmployeeDeduction({ employeeId }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <FormEmployeeDeduction
        employeeId={employeeId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Potongan</CardTitle>
          <CardAction>
            <Button variant="secondary" size="sm" onClick={() => setIsFormOpen(true)}>
              <PlusCircle />
              Tambah Potongan
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    </>
  );
}
