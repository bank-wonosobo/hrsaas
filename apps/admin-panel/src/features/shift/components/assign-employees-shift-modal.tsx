"use client";
import Button from "@/components/ui/button/button";
import Modal from "@/components/ui/modal/modal";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useBulkAssignEmployeesShift } from "../hooks/use-bulk-assign-employees-shift";
import { Shift } from "../schemas/shift-schema";
import { getShiftById } from "../services/shift-service";

interface Props {
  shift: Shift;
}

export function AssignEmployeesShiftModal({ shift }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const { data: employeesData, isLoading } = useGetEmployees({
    key: "",
    page: 1,
    size: 200,
  });

  const { data: detailData } = useQuery({
    queryKey: ["shifts", shift.id],
    queryFn: () => getShiftById(shift.id),
    enabled: open,
  });

  useEffect(() => {
    if (open && detailData?.data?.employees) {
      setSelected(detailData.data.employees.map((e) => e.id));
    }
  }, [open, detailData]);

  const mutation = useBulkAssignEmployeesShift();

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    mutation.mutate(
      { shiftId: shift.id, employeeIds: selected },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
      >
        <Users size={16} />
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`Assign Karyawan — ${shift.name}`}
        maxWidth="sm"
      >
        <div className="mt-3 space-y-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">Memuat karyawan...</p>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {employeesData?.data.map((employee) => (
                <label
                  key={employee.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(employee.id)}
                    onChange={() => toggle(employee.id)}
                    className="w-4 h-4 accent-black"
                  />
                  <div>
                    <p className="text-sm font-medium">{employee.fullname}</p>
                    <p className="text-xs text-gray-400">
                      {employee.employee_number}
                    </p>
                  </div>
                </label>
              ))}
              {!employeesData?.data.length && (
                <p className="text-sm text-gray-400">
                  Belum ada karyawan tersedia.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-gray-500">
              {selected.length} karyawan dipilih
            </span>
            <Button onClick={handleSubmit} loading={mutation.isPending}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
