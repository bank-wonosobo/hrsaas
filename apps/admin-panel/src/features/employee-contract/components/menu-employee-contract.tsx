"use client";

import Button from "@/components/ui/button/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import FormEmployeeContract from "./form-employee-contract";

interface Props {
  employeeId: string;
}

export default function MenuEmployeeContract({ employeeId }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <FormEmployeeContract
        employeeId={employeeId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Riwayat Kontrak</h2>
        <Button
          variant="secondary"
          size="sm"
          prefixIcon={<PlusCircle size={16} />}
          onClick={() => setIsFormOpen(true)}
        >
          Tambah Kontrak
        </Button>
      </div>
    </>
  );
}
