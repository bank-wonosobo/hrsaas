"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchTimeOffReq } from "../hooks/use-search-timeoffreq";
import { TimeOffRequest } from "../schemas/time-off-schema";

interface Props {
  employeeId?: string;
  requestStatus?: string;
}

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const MONTH_LABELS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const SHORT_MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function statusColor(status: string) {
  if (status === "APPROVED")
    return "bg-green-100 text-green-700 border-green-200";
  if (status === "REJECTED") return "bg-red-100 text-red-700 border-red-200";
  return "bg-amber-100 text-amber-700 border-amber-200";
}

function formatShortDate(ts: number) {
  const d = new Date(ts);
  return `${d.getDate()} ${SHORT_MONTH[d.getMonth()]}`;
}

export default function CalendarTimeOff({ employeeId, requestStatus }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // default selected day: today jika bulan ini, otherwise null
  const [selectedDay, setSelectedDay] = useState<number | null>(
    today.getDate(),
  );

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const daysInMonth = monthEnd.getDate();

  // Backend ParseDateToUnixMilli expects "YYYY-MM-DD" format
  const pad = (n: number) => String(n).padStart(2, "0");
  const startDateISO = `${year}-${pad(month + 1)}-01`;
  const endDateISO = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;

  const { data, isLoading } = useSearchTimeOffReq({
    employee_id: employeeId,
    request_status: requestStatus,
    start_date: startDateISO,
    end_date: endDateISO,
    page: 1,
    size: 100,
  });

  // Map: tanggal → list TimeOffRequest yang overlap hari itu
  const requestsByDay = useMemo(() => {
    const map: Record<number, TimeOffRequest[]> = {};

    for (const req of data?.data ?? []) {
      const start = new Date(req.start_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.end_date);
      end.setHours(23, 59, 59, 999);

      const cur = new Date(Math.max(start.getTime(), monthStart.getTime()));
      cur.setHours(0, 0, 0, 0);
      const last = new Date(Math.min(end.getTime(), monthEnd.getTime()));

      while (cur <= last) {
        if (cur.getMonth() === month && cur.getFullYear() === year) {
          const d = cur.getDate();
          if (!map[d]) map[d] = [];
          if (!map[d].find((r) => r.id === req.id)) map[d].push(req);
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    return map;
  }, [data, month, year]); // eslint-disable-line react-hooks/exhaustive-deps

  // Karyawan yang APPROVED pada hari yang dipilih
  const onLeaveToday: TimeOffRequest[] = useMemo(() => {
    if (!selectedDay) return [];
    return (requestsByDay[selectedDay] ?? []).filter(
      (r) => r.request_status === "APPROVED",
    );
  }, [requestsByDay, selectedDay]);

  const firstWeekday = monthStart.getDay();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prevMonth() {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    // reset selected day ke hari ini jika pindah ke bulan yang berisi hari ini
    const isCurrentMonth =
      newMonth === today.getMonth() && newYear === today.getFullYear();
    setSelectedDay(isCurrentMonth ? today.getDate() : null);
  }

  function nextMonth() {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    const isCurrentMonth =
      newMonth === today.getMonth() && newYear === today.getFullYear();
    setSelectedDay(isCurrentMonth ? today.getDate() : null);
  }

  const isTodayCell = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const selectedDate = selectedDay ? new Date(year, month, selectedDay) : null;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <Card className="min-w-0 flex-1 gap-0">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Bulan sebelumnya"
            onClick={prevMonth}
          >
            <ChevronLeft />
          </Button>
          <CardTitle>
            {MONTH_LABELS[month]} {year}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Bulan berikutnya"
            onClick={nextMonth}
          >
            <ChevronRight />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-7">
            {DAY_LABELS.map((dayLabel) => (
              <div
                key={dayLabel}
                className="py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {dayLabel}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border">
              {cells.map((_, index) => (
                <Skeleton key={index} className="min-h-20 rounded-none" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border">
              {cells.map((day, index) => {
                const requests = day ? (requestsByDay[day] ?? []) : [];
                const isSelected = day !== null && day === selectedDay;
                const approvedCount = requests.filter(
                  (request) => request.request_status === "APPROVED",
                ).length;

                const dayContent = day ? (
                  <>
                    <span
                      className={cn(
                        "mb-1 inline-flex size-6 items-center justify-center self-start rounded-full text-xs font-medium",
                        isTodayCell(day)
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {day}
                    </span>
                    <div className="flex w-full min-w-0 flex-col gap-0.5">
                      {requests.slice(0, 3).map((request) => (
                        <Badge
                          key={request.id}
                          variant="outline"
                          title={`${request.employee.fullname} — ${request.time_off_type.name}`}
                          className={cn(
                            "block h-4 w-full max-w-full truncate rounded-sm px-1 py-0 text-left text-[9px] leading-4",
                            statusColor(request.request_status),
                          )}
                        >
                          {request.employee.fullname}
                        </Badge>
                      ))}
                      {requests.length > 3 && (
                        <span className="truncate pl-0.5 text-[10px] text-muted-foreground">
                          +{requests.length - 3} lagi
                        </span>
                      )}
                    </div>
                    {approvedCount > 0 && (
                      <span className="mt-auto flex items-center gap-1 pt-1 text-[9px] font-medium text-emerald-700 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        {approvedCount} cuti
                      </span>
                    )}
                  </>
                ) : null;

                return day ? (
                  <Button
                    key={index}
                    type="button"
                    variant={isSelected ? "secondary" : "ghost"}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "flex h-auto min-h-20 min-w-0 flex-col items-start justify-start gap-0 overflow-hidden rounded-none bg-background p-1.5 text-left hover:bg-muted/50",
                      isSelected && "ring-1 ring-inset ring-ring",
                    )}
                  >
                    {dayContent}
                  </Button>
                ) : (
                  <div
                    key={index}
                    aria-hidden="true"
                    className="min-h-20 bg-muted/30"
                  />
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Pending", status: "PENDING" },
              { label: "Disetujui", status: "APPROVED" },
              { label: "Ditolak", status: "REJECTED" },
            ].map(({ label, status }) => (
              <Badge
                key={status}
                variant="outline"
                className={cn("font-normal", statusColor(status))}
              >
                {label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full shrink-0 gap-0 lg:w-72">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-sm">
            <UserCheck className="size-4 text-emerald-600" />
            Sedang Cuti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {selectedDate && (
            <p className="text-sm text-muted-foreground">
              {selectedDate.getDate()} {MONTH_LABELS[selectedDate.getMonth()]}{" "}
              {selectedDate.getFullYear()}
            </p>
          )}

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : onLeaveToday.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <UserCheck className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {selectedDay ? "Tidak ada karyawan yang cuti" : "Pilih tanggal"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {onLeaveToday.map((request) => (
                <div
                  key={request.id}
                  className="flex items-start gap-2.5 rounded-md border bg-muted/30 p-3"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                    {request.employee.fullname.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {request.employee.fullname}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {request.time_off_type.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatShortDate(request.start_date)} –{" "}
                      {formatShortDate(request.end_date)} (
                      {request.requested_days} hari)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
