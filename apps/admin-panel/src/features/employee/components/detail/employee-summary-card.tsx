"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDetailEmployee } from "@/features/employee/hooks/use-detail-employee";
import { cn } from "cn";
import {
  BriefcaseBusiness,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  UserRound,
} from "lucide-react";

type Props = {
  id: string;
};

export default function EmployeeSummaryCard({ id }: Props) {
  const { data, isLoading, isError, refetch } = useDetailEmployee(id);
  const employee = data?.data;
  const contract = employee?.contracts?.[0];

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-primary shadow-md">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="size-16 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-36" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !employee) {
    return (
      <Card className="border-l-4 border-l-destructive shadow-md">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Informasi utama karyawan gagal dimuat.
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw />
            Coba lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  const active = employee.is_active ?? true;
  const initials =
    employee.fullname
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?";

  return (
    <Card className="border-l-4 border-l-primary bg-linear-to-r from-card to-primary/5 shadow-md">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar size="lg" className="size-16 shrink-0 ring-4 ring-primary/10">
          <AvatarImage
            src={employee.user?.image_url || undefined}
            alt={employee.fullname}
          />
          <AvatarFallback className="text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">{employee.fullname}</h2>
            <Badge
              className={cn(
                active
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200"
                  : "bg-muted text-muted-foreground hover:bg-muted",
              )}
            >
              {active ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <UserRound className="size-4" />
              {employee.employee_number}
            </span>
            {contract && (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <BriefcaseBusiness className="size-4" />
                {contract.position.name} · {contract.division.name}
              </span>
            )}
            {employee.phone && (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Phone className="size-4" />
                {employee.phone}
              </span>
            )}
            {employee.user?.email && (
              <span className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{employee.user.email}</span>
              </span>
            )}
            {(employee.city || employee.timezone) && (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4" />
                {[employee.city, employee.timezone].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
