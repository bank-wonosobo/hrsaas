"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { searchAnnouncements } from "@/features/announcement/services/announcement-service";
import { searchAttendance } from "@/features/attendance/services/search-attendance";
import { searchSanction } from "@/features/employee-sanction/services/search-sanction";
import { getEmployees } from "@/features/employee/services/employee-service";
import { getEmployeeContracts } from "@/features/employee-contract/services/employee-contract-service";
import { searchTimeOffApproval } from "@/features/time-off-approval/services/search-time-off-approval";
import { searchVisit } from "@/features/visit/services/search-visit";
import toIDDate from "@/lib/utils";
import { useQueries } from "@tanstack/react-query";
import { addDays, endOfDay, format, startOfDay } from "date-fns";
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Clock3,
  FileClock,
  Megaphone,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const numberFormatter = new Intl.NumberFormat("id-ID");
const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function MetricCard({
  icon,
  label,
  value,
  href,
  description,
  isLoading,
  isError,
  onRetry,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number | undefined;
  href: string;
  description: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  tone: string;
}) {
  return (
    <Card className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div className={`rounded-xl p-2.5 ${tone}`}>{icon}</div>
        <Link
          href={href}
          aria-label={`Lihat ${label.toLowerCase()}`}
          className="rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <Link href={href} className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {isLoading && value === undefined ? (
            <Skeleton className="mb-2 h-8 w-20" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {value === undefined ? "—" : numberFormatter.format(value)}
            </p>
          )}
          <p className="mt-1 text-sm font-medium">{label}</p>
        </Link>
        <CardDescription className="mt-1">
          {isError && value === undefined ? (
            <span className="flex flex-wrap items-center gap-2 text-destructive">
              Gagal memuat data
              <button
                type="button"
                className="underline underline-offset-2"
                onClick={onRetry}
              >
                Coba lagi
              </button>
            </span>
          ) : (
            description
          )}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function SectionHeading({
  icon,
  title,
  href,
}: {
  icon: ReactNode;
  title: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="text-muted-foreground">{icon}</span>
        <CardTitle className="text-base">{title}</CardTitle>
      </div>
      <Button asChild variant="ghost" size="sm" className="shrink-0">
        <Link href={href}>
          Lihat semua <ChevronRight />
        </Link>
      </Button>
    </div>
  );
}

export default function DashboardOverview() {
  const today = new Date();
  const attendanceDate = format(today, "yyyy-MM-dd");
  const contractEndDateFrom = startOfDay(today).getTime();
  const contractEndDateTo = endOfDay(addDays(today, 30)).getTime();

  const results = useQueries({
    queries: [
      {
        queryKey: ["employees", "", 1, 1],
        queryFn: () => getEmployees({ page: 1, size: 1 }),
      },
      {
        queryKey: [
          "time-off-approvals",
          { status: "PENDING", page: 1, size: 5 },
        ],
        queryFn: () =>
          searchTimeOffApproval({ status: "PENDING", page: 1, size: 5 }),
      },
      {
        queryKey: ["visits", { page: 1, size: 5, sort_by: "newest" }],
        queryFn: () => searchVisit({ page: 1, size: 5, sort_by: "newest" }),
      },
      {
        queryKey: ["employee-sanctions", { page: 1, size: 1, status: true }],
        queryFn: () => searchSanction({ page: 1, size: 1, status: true }),
      },
      {
        queryKey: ["announcements", "", 1, 4],
        queryFn: () => searchAnnouncements({ page: 1, size: 4 }),
      },
      {
        queryKey: [
          "employee-contracts",
          {
            active_only: "true",
            end_date_from: contractEndDateFrom,
            end_date_to: contractEndDateTo,
            page: 1,
            size: 5,
          },
        ],
        queryFn: () =>
          getEmployeeContracts({
            active_only: "true",
            end_date_from: contractEndDateFrom,
            end_date_to: contractEndDateTo,
            page: 1,
            size: 5,
          }),
      },
      {
        queryKey: ["attendances", { date: attendanceDate, page: 1, size: 1 }],
        queryFn: () =>
          searchAttendance({
            start_date: attendanceDate,
            end_date: attendanceDate,
            page: 1,
            size: 1,
          }),
      },
    ],
  });

  const [
    employees,
    approvals,
    visits,
    sanctions,
    announcements,
    contracts,
    attendance,
  ] = results;
  const metrics = [
    {
      icon: <Users className="size-5" />,
      label: "Total karyawan",
      value: employees.data?.paging?.total_item,
      href: "/employees",
      description: "Data karyawan terdaftar",
      query: employees,
      tone: "bg-primary/15 text-foreground",
    },
    {
      icon: <CalendarDays className="size-5" />,
      label: "Cuti menunggu",
      value: approvals.data?.paging?.total_item,
      href: "/time-off-approvals",
      description: "Perlu ditinjau dan disetujui",
      query: approvals,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      icon: <MapPin className="size-5" />,
      label: "Total kunjungan",
      value: visits.data?.paging?.total_item,
      href: "/visits",
      description: "Catatan kunjungan tercatat",
      query: visits,
      tone:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
    {
      icon: <AlertTriangle className="size-5" />,
      label: "Sanksi aktif",
      value: sanctions.data?.paging?.total_item,
      href: "/employee-sanctions",
      description: "Sanksi yang masih berlaku",
      query: sanctions,
      tone: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    },
    {
      icon: <FileClock className="size-5" />,
      label: "Kontrak segera berakhir",
      value: contracts.data?.paging?.total_item,
      href: "/employees",
      description: "Dalam 30 hari ke depan",
      query: contracts,
      tone:
        "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    },
    {
      icon: <CalendarCheck className="size-5" />,
      label: "Presensi hari ini",
      value: attendance.data?.paging?.total_item,
      href: "/attendances",
      description: "Catatan presensi masuk hari ini",
      query: attendance,
      tone: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    },
  ];

  const shortcuts = [
    {
      label: "Data karyawan",
      description: "Kelola profil dan data pegawai",
      href: "/employees",
      icon: <Users />,
    },
    {
      label: "Persetujuan cuti",
      description: "Tinjau permohonan yang masuk",
      href: "/time-off-approvals",
      icon: <CalendarPlus />,
    },
    {
      label: "Kehadiran",
      description: "Pantau catatan kehadiran",
      href: "/attendances",
      icon: <Clock3 />,
    },
    {
      label: "Penggajian",
      description: "Kelola proses dan data gaji",
      href: "/payrolls",
      icon: <BriefcaseBusiness />,
    },
  ];

  const recentApprovals = approvals.data?.data ?? [];
  const recentVisits = visits.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6 py-6 pb-8">
      <section className="flex flex-col gap-1">
        <p className="text-sm font-medium text-primary">BW Akses+ · HRIS</p>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan operasional dan aktivitas sumber daya manusia.
        </p>
      </section>

      <section
        aria-label="Ringkasan HR"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      >
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
            isLoading={metric.query.isLoading}
            isError={metric.query.isError}
            onRetry={() => void metric.query.refetch()}
          />
        ))}
      </section>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Akses cepat</CardTitle>
          <CardDescription>
            Buka modul yang sering digunakan untuk pekerjaan harian.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((shortcut) => (
            <Button
              key={shortcut.href}
              asChild
              variant="outline"
              className="h-auto justify-start gap-3 px-3 py-3 text-left"
            >
              <Link href={shortcut.href}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  {shortcut.icon}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {shortcut.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                    {shortcut.description}
                  </span>
                </span>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <section
        aria-label="Aktivitas terbaru"
        className="grid gap-4 xl:grid-cols-2"
      >
        <Card>
          <CardHeader className="border-b">
            <SectionHeading
              icon={<Megaphone className="size-4" />}
              title="Pengumuman terbaru"
              href="/announcements"
            />
          </CardHeader>
          <CardContent className="p-0">
            {announcements.isLoading ? (
              <div className="space-y-4 p-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : announcements.isError && !announcements.data ? (
              <div className="flex flex-col items-center gap-2 px-5 py-9 text-center">
                <p className="text-sm text-muted-foreground">
                  Pengumuman gagal dimuat.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void announcements.refetch()}
                >
                  <RefreshCw /> Coba lagi
                </Button>
              </div>
            ) : (announcements.data?.data ?? []).length === 0 ? (
              <div className="px-5 py-9 text-center">
                <p className="text-sm font-medium">Belum ada pengumuman</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pengumuman terbaru akan muncul di sini.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {(announcements.data?.data ?? []).map((announcement) => (
                  <li key={announcement.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {announcement.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {announcement.content}
                        </p>
                      </div>
                      {announcement.category && (
                        <Badge variant="outline" className="shrink-0">
                          {announcement.category}
                        </Badge>
                      )}
                    </div>
                    {announcement.created_at && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {shortDateFormatter.format(
                          new Date(announcement.created_at),
                        )}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <SectionHeading
              icon={<FileClock className="size-4" />}
              title="Kontrak berakhir dalam 30 hari"
              href="/employees"
            />
            <CardDescription>
              Tinjau kontrak aktif berikut untuk menindaklanjuti perpanjangan.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {contracts.isLoading ? (
              <div className="space-y-4 p-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/5" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : contracts.isError && !contracts.data ? (
              <div className="flex flex-col items-center gap-2 px-5 py-9 text-center">
                <p className="text-sm text-muted-foreground">
                  Data kontrak gagal dimuat.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void contracts.refetch()}
                >
                  <RefreshCw /> Coba lagi
                </Button>
              </div>
            ) : (contracts.data?.data ?? []).length === 0 ? (
              <div className="px-5 py-9 text-center">
                <p className="text-sm font-medium">
                  Tidak ada kontrak yang segera berakhir
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tidak ada kontrak aktif berakhir dalam 30 hari ke depan.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {(contracts.data?.data ?? []).map((contract) => {
                  const daysRemaining = contract.end_date
                    ? Math.max(
                        0,
                        Math.ceil(
                          (contract.end_date - today.getTime()) /
                            (24 * 60 * 60 * 1000),
                        ),
                      )
                    : 0;

                  return (
                    <li
                      key={contract.id}
                      className="flex items-center justify-between gap-3 px-5 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-800 dark:bg-orange-950 dark:text-orange-200">
                          {contract.employee?.fullname?.charAt(0).toUpperCase() ||
                            "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {contract.employee?.fullname ?? contract.employee_id}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {contract.position.name} · {contract.division.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge
                          className={
                            daysRemaining <= 7
                              ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
                              : "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200"
                          }
                        >
                          {daysRemaining === 0
                            ? "Berakhir hari ini"
                            : `${daysRemaining} hari lagi`}
                        </Badge>
                        {contract.end_date && (
                          <span className="text-xs text-muted-foreground">
                            {shortDateFormatter.format(
                              new Date(contract.end_date),
                            )}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <SectionHeading
              icon={<CalendarDays className="size-4" />}
              title="Pengajuan cuti menunggu"
              href="/time-off-approvals"
            />
          </CardHeader>
          <CardContent className="p-0">
            {approvals.isLoading ? (
              <div className="space-y-4 p-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/5" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : approvals.isError && !approvals.data ? (
              <div className="flex flex-col items-center gap-2 px-5 py-9 text-center">
                <p className="text-sm text-muted-foreground">
                  Pengajuan cuti gagal dimuat.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void approvals.refetch()}
                >
                  <RefreshCw /> Coba lagi
                </Button>
              </div>
            ) : recentApprovals.length === 0 ? (
              <div className="px-5 py-9 text-center">
                <p className="text-sm font-medium">Tidak ada pengajuan baru</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Semua permohonan cuti sudah ditinjau.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {recentApprovals.map((approval) => {
                  const request = approval.time_off_request;
                  const employee = request.employee;
                  const employeeName =
                    typeof employee.fullname === "string"
                      ? employee.fullname
                      : "Karyawan";

                  return (
                    <li
                      key={approval.id}
                      className="flex items-center justify-between gap-3 px-5 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-foreground">
                          {employeeName.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {employeeName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {request.time_off_type.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                          Menunggu
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {request.requested_days} hari
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <SectionHeading
              icon={<MapPin className="size-4" />}
              title="Kunjungan terbaru"
              href="/visits"
            />
          </CardHeader>
          <CardContent className="p-0">
            {visits.isLoading ? (
              <div className="space-y-4 p-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/5" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : visits.isError && !visits.data ? (
              <div className="flex flex-col items-center gap-2 px-5 py-9 text-center">
                <p className="text-sm text-muted-foreground">
                  Aktivitas kunjungan gagal dimuat.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void visits.refetch()}
                >
                  <RefreshCw /> Coba lagi
                </Button>
              </div>
            ) : recentVisits.length === 0 ? (
              <div className="px-5 py-9 text-center">
                <p className="text-sm font-medium">Belum ada kunjungan</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Catatan kunjungan akan muncul di sini.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {recentVisits.map((visit) => (
                  <li
                    key={visit.id}
                    className="flex items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        {visit.employee_name.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {visit.employee_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {visit.client_name}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {toIDDate(new Date(visit.created_at * 1000))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
