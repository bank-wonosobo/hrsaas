"use client";

import Button from "@/components/ui/button/button";
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Potongan</h2>
        <Button
          variant="secondary"
          size="sm"
          prefixIcon={<PlusCircle size={16} />}
          onClick={() => setIsFormOpen(true)}
        >
          Tambah Potongan
        </Button>
      </div>
    </>
  );
}
