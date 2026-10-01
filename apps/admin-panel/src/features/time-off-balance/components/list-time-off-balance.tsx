"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetTimeOffBalances } from "../hooks/use-get-time-off-balances";
import { SearchTimeOffBalance } from "../schemas/time-off-balance-schema";

interface Props {
  employeeId: string;
  search: SearchTimeOffBalance;
}

export default function ListTimeOffBalance({ employeeId, search }: Props) {
  const { data, isLoading, isError } = useGetTimeOffBalances({
    ...search,
    employee_id: employeeId,
  });

  if (isLoading) {
    return <Card><CardContent className="space-y-3"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-3/4" /></CardContent></Card>;
  }
  if (isError) {
    return <Card><CardContent className="py-6 text-sm text-destructive">Saldo cuti gagal dimuat. Coba muat ulang halaman.</CardContent></Card>;
  }

  const balances = data?.data ?? [];
  if (balances.length === 0) {
    return <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Belum ada saldo cuti untuk filter ini.</CardContent></Card>;
  }

  return (
    <Card><CardContent className="p-0">
      <Table>
        <TableHeader><TableRow>
          {["Jenis Cuti", "Tahun", "Hak Cuti", "Terpakai", "Sisa", "Berbasis Kuota"].map((header) => <TableHead key={header}>{header}</TableHead>)}
        </TableRow></TableHeader>
        <TableBody>{balances.map((row) => (
          <TableRow key={row.id}>
            <TableCell><div className="flex flex-col"><span className="font-medium">{row.time_off_type.name}</span><span className="text-xs text-muted-foreground">{row.time_off_type.category}</span></div></TableCell>
            <TableCell className="font-medium">{row.period_year}</TableCell>
            <TableCell>{row.entitled_days} hari</TableCell>
            <TableCell className="text-orange-600">{row.used_days} hari</TableCell>
            <TableCell className={row.remaining_days <= 0 ? "font-medium text-destructive" : "font-medium text-green-700"}>{row.remaining_days} hari</TableCell>
            <TableCell><Badge variant={row.time_off_type.is_quota_based ? "default" : "secondary"}>{row.time_off_type.is_quota_based ? "Ya" : "Tidak"}</Badge></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </CardContent></Card>
  );
}
