"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";
import { Payroll, PayrollDetail } from "../schemas/payroll-schema";
import PayrollDetailModal from "./payroll-detail-modal";

interface Props {
  payroll: Payroll;
}

export default function PayrollEmployeeTable({ payroll }: Props) {
  const [selected, setSelected] = useState<PayrollDetail | null>(null);
  const details = payroll.details ?? [];
  const editable = payroll.status === "DRAFT" || payroll.status === "CALCULATED";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rincian per Pegawai</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {details.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="font-medium">Rincian payroll belum tersedia</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Klik &ldquo;Hitung Payroll&rdquo; untuk membuat rincian per pegawai.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Pegawai</TableHead>
                <TableHead className="text-right">Gaji Pokok</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Potongan</TableHead>
                <TableHead className="text-right">Take Home Pay</TableHead>
                <TableHead className="w-24 text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {row.employee?.fullname ?? row.employee_id}
                      </p>
                      {row.employee?.employee_number && (
                        <p className="text-xs text-muted-foreground">
                          {row.employee.employee_number}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(row.basic_salary)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(row.gross_salary)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-destructive">
                    -{formatRupiah(row.total_deduction)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatRupiah(row.net_salary)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelected(row)}
                    >
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {selected && (
        <PayrollDetailModal
          detail={selected}
          payrollId={payroll.id}
          editable={editable}
          isOpen={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </Card>
  );
}
