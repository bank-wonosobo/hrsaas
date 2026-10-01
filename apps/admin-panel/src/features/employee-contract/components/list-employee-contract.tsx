"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toIDDate from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useGetEmployeeContracts } from "../hooks/use-get-employee-contracts";
import { EmployeeContract } from "../schemas/employee-contract-schema";
import EditEmployeeContract from "./edit-employee-contract";

interface Props {
  employeeId: string;
}

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const isContractActive = (start: number, end?: number | null) => {
  const now = Date.now();
  return start <= now && (!end || end >= now);
};

export default function ListEmployeeContract({ employeeId }: Props) {
  const [editTarget, setEditTarget] = useState<EmployeeContract | null>(null);
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useGetEmployeeContracts({
    employee_id: employeeId,
    page: 1,
    size: 50,
  });

  const contracts = data?.data ?? [];

  return (
    <>
      {editTarget && (
        <EditEmployeeContract
          contract={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      <Card>
        <CardContent>
          {isLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground" role="status">
              Memuat data kontrak...
            </p>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-destructive" role="alert">
                Gagal memuat riwayat kontrak.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
                disabled={isRefetching}
              >
                {isRefetching ? "Memuat ulang..." : "Coba lagi"}
              </Button>
            </div>
          ) : contracts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada kontrak.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jenis Kontrak</TableHead>
                  <TableHead>Divisi / Jabatan</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Gaji</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => {
                  const active =
                    isContractActive(
                      contract.start_date,
                      contract.end_date,
                    ) && contract.is_active;

                  return (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">
                            {contract.contract_type}
                          </span>
                          {contract.employee_status && (
                            <Badge variant="secondary">
                              Gol. {contract.employee_status}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{contract.division.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {contract.position.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{toIDDate(new Date(contract.start_date))}</div>
                        <div className="text-xs text-muted-foreground">
                          {contract.end_date
                            ? toIDDate(new Date(contract.end_date))
                            : "Tidak ada batas"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={active ? "default" : "secondary"}>
                          {active ? "Aktif" : "Berakhir"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(contract.salary)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit kontrak ${contract.contract_type}`}
                          onClick={() => setEditTarget(contract)}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
