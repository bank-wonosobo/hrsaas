"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchAttendanceRequest } from "@/features/attendance/schemas/attendance-schema";
import { exportAttendance } from "@/features/attendance/services/export-attendance";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { mapToOptions } from "@/lib/utils";
import { Download, LoaderCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  search: SearchAttendanceRequest;
}

export default function ExportAttendance({ search }: Props) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [employeeID, setEmployeeID] = useState("");
  const [startDate, setStartDate] = useState(search.start_date ?? "");
  const [endDate, setEndDate] = useState(search.end_date ?? "");

  const { data: employees } = useGetEmployees({ size: 500 });
  const employeeOptions = mapToOptions(
    employees?.data ?? [],
    (employee) => employee.fullname,
    (employee) => employee.id,
  );

  async function handleExport() {
    if (!startDate || !endDate) {
      toast.error("Pilih rentang tanggal untuk export.");
      return;
    }
    if (startDate > endDate) {
      toast.error("Tanggal mulai tidak boleh melewati tanggal selesai.");
      return;
    }

    setIsExporting(true);
    try {
      const file = await exportAttendance({
        employee_id: employeeID,
        start_date: startDate,
        end_date: endDate,
      });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");

      link.href = url;
      link.download = `export-attendance-${startDate}-${endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengunduh data kehadiran.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Download />
          Export Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export kehadiran</DialogTitle>
          <DialogDescription>
            Pilih karyawan dan rentang tanggal untuk file Excel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attendance-export-employee">Karyawan</Label>
            <Select
              value={employeeID || "all"}
              onValueChange={(value) =>
                setEmployeeID(value === "all" ? "" : value)
              }
            >
              <SelectTrigger id="attendance-export-employee" className="w-full">
                <SelectValue placeholder="Semua karyawan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua karyawan</SelectItem>
                {employeeOptions.map((employee) => (
                  <SelectItem key={employee.value} value={employee.value}>
                    {employee.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="attendance-export-start">Dari tanggal</Label>
              <Input
                id="attendance-export-start"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-export-end">Sampai tanggal</Label>
              <Input
                id="attendance-export-end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isExporting}
          >
            Batal
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Download />
            )}
            {isExporting ? "Menyiapkan..." : "Download Excel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
