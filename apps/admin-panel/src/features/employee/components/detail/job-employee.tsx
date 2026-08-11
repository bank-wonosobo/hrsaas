"use client";
import EditableField from "@/components/shared/editable-field/editable-field";
import Button from "@/components/ui/button/button";
import toIDDate, { diffDateDetail } from "@/lib/utils";
import { Edit2 } from "lucide-react";
import { useDetailEmployee } from "../../hooks/use-detail-employee";

interface Props {
  id: string;
}

export default function JobEmployee({ id }: Props) {
  const { data } = useDetailEmployee(id);
  const employee = data?.data;
  const startDate = employee?.contracts?.[0].start_date
    ? new Date(employee.contracts[0].start_date)
    : undefined;
  const serviceDuration = startDate
    ? diffDateDetail(startDate, new Date())
    : undefined;

  return (
    <div className="border p-4 rounded-2xl">
      <div className="flex border-b pb-3 items-center justify-between">
        <h2 className="text-lg font-semibold">Informasi Karyawan</h2>
        <Button variant="ghost">
          <Edit2 size={18} />
        </Button>
      </div>
      <div className="w-full py-5 space-y-5">
        <EditableField label="ID Karyawan" value={employee?.employee_number} />
        <div></div>
        <EditableField
          label="Tanggal masuk"
          value={startDate ? toIDDate(startDate) : ""}
        />

        <div className="w-full flex ">
          <label className="w-30 text-zinc-500">Masa Kerja</label>
          <p className="font-medium">
            {serviceDuration
              ? `${serviceDuration.years} tahun ${serviceDuration.months} bulan ${serviceDuration.days} hari`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
