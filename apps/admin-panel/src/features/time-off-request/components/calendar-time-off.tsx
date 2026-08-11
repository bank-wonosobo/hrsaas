"use client";

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
    <div className="flex gap-4 flex-col lg:flex-row">
      {/* ── Kalender ── */}
      <div className="bg-white rounded-2xl border p-5 flex-1 min-w-0">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-semibold">
            {MONTH_LABELS[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="text-center text-[11px] font-medium text-zinc-400 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-sm text-zinc-400">
            Memuat data...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-zinc-100 rounded-xl overflow-hidden">
            {cells.map((day, i) => {
              const requests = day ? (requestsByDay[day] ?? []) : [];
              const isSelected = day !== null && day === selectedDay;
              const approvedCount = requests.filter(
                (r) => r.request_status === "APPROVED",
              ).length;

              return (
                <div
                  key={i}
                  onClick={() => day && setSelectedDay(day)}
                  className={cn(
                    "bg-white min-h-20 p-1.5 flex flex-col transition-colors",
                    !day && "bg-zinc-50/60",
                    day && "cursor-pointer hover:bg-zinc-50",
                    isSelected && "bg-zinc-50 ring-1 ring-inset ring-zinc-300",
                  )}
                >
                  {day && (
                    <>
                      <span
                        className={cn(
                          "text-xs font-medium inline-flex w-6 h-6 items-center justify-center rounded-full mb-1 self-start",
                          isTodayCell(day)
                            ? "bg-black text-white"
                            : "text-zinc-600",
                        )}
                      >
                        {day}
                      </span>

                      <div className="flex flex-col gap-0.5">
                        {requests.slice(0, 3).map((req, j) => (
                          <div
                            key={j}
                            title={`${req.employee.fullname} — ${req.time_off_type.name}`}
                            className={cn(
                              "text-[10px] px-1 py-0.5 rounded border truncate leading-tight",
                              statusColor(req.request_status),
                            )}
                          >
                            {req.employee.fullname}
                          </div>
                        ))}
                        {requests.length > 3 && (
                          <span className="text-[10px] text-zinc-400 pl-0.5">
                            +{requests.length - 3} lagi
                          </span>
                        )}
                      </div>

                      {/* dot indicator approved */}
                      {approvedCount > 0 && (
                        <div className="mt-auto pt-1 flex items-center gap-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-[9px] text-green-600 font-medium">
                            {approvedCount} cuti
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 flex-wrap">
          {[
            { label: "Pending", cls: "bg-amber-100 border-amber-200" },
            { label: "Disetujui", cls: "bg-green-100 border-green-200" },
            { label: "Ditolak", cls: "bg-red-100 border-red-200" },
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded-sm border", cls)} />
              <span className="text-xs text-zinc-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel: Sedang Cuti ── */}
      <div className="bg-white rounded-2xl border p-5 w-full lg:w-72 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-semibold">Sedang Cuti</h3>
        </div>

        {selectedDate && (
          <p className="text-xs text-zinc-400 mb-3">
            {selectedDate.getDate()} {MONTH_LABELS[selectedDate.getMonth()]}{" "}
            {selectedDate.getFullYear()}
          </p>
        )}

        {isLoading ? (
          <p className="text-xs text-zinc-400">Memuat...</p>
        ) : onLeaveToday.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="text-xs text-zinc-400">
              {selectedDay ? "Tidak ada karyawan yang cuti" : "Pilih tanggal"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {onLeaveToday.map((req) => (
              <div
                key={req.id}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-green-50 border border-green-100"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-green-200 text-green-800 text-xs font-semibold flex items-center justify-center shrink-0">
                  {req.employee.fullname.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-800 truncate">
                    {req.employee.fullname}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {req.time_off_type.name}
                  </p>
                  <p className="text-[10px] text-green-600 mt-0.5">
                    {formatShortDate(req.start_date)} –{" "}
                    {formatShortDate(req.end_date)} ({req.requested_days} hari)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
