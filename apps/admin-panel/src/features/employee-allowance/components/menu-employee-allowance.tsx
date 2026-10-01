"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import FormEmployeeAllowance from "./form-employee-allowance";

interface Props {
  employeeId: string;
}

export default function MenuEmployeeAllowance({ employeeId }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <FormEmployeeAllowance
        employeeId={employeeId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
      <Card className="shadow-none bg-secondary">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Tunjangan</CardTitle>
          <CardAction>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsFormOpen(true)}
            >
              <PlusCircle />
              Tambah Tunjangan
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    </>
  );
}
