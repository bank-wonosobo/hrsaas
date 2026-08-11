"use client";

import Button from "@/components/ui/button/button";
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Riwayat Gaji Pokok</h2>
        <Button
          variant="secondary"
          size="sm"
          prefixIcon={<PlusCircle size={16} />}
          onClick={() => setIsFormOpen(true)}
        >
          Tambah Gaji
        </Button>
      </div>
    </>
  );
}
