"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check } from "lucide-react";
import { useGetAllTimeOffType } from "../hooks/use-getall-time-off-type";

export default function ListTimeOffType(): React.ReactNode {
  const { data, isLoading, isFetching } = useGetAllTimeOffType();

  if (isLoading || isFetching) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Berbasis Kuota</TableHead>
              <TableHead>Kuota Default</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data?.length ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Belum ada jenis cuti.
                </TableCell>
              </TableRow>
            ) : (
              data.map((timeOffType) => (
                <TableRow key={timeOffType.id}>
                  <TableCell className="font-medium">
                    {timeOffType.name}
                  </TableCell>
                  <TableCell>{timeOffType.category}</TableCell>
                  <TableCell>
                    {timeOffType.is_quota_based ? (
                      <Badge variant="secondary" className="gap-1.5">
                        <Check />
                        Ya
                      </Badge>
                    ) : (
                      <Badge variant="outline">Tidak</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {timeOffType.is_quota_based
                      ? `${timeOffType.default_quota_days} hari`
                      : "–"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
