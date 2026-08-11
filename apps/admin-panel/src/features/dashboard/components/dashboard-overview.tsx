"use client";

import Badge from "@/components/ui/badge/badge";
import { searchSanction } from "@/features/employee-sanction/services/search-sanction";
import { getEmployees } from "@/features/employee/services/employee-service";
import { searchTimeOffApproval } from "@/features/time-off-approval/services/search-time-off-approval";
import { searchVisit } from "@/features/visit/services/search-visit";
import toIDDate from "@/lib/utils";
import { useQueries } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarClock,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

function StatCard({
  icon,
  label,
  value,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl border border-zinc-100 px-6 py-5 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-zinc-900">
            {value === undefined ? (
              <span className="inline-block w-12 h-7 bg-zinc-100 animate-pulse rounded" />
            ) : (
              value.toLocaleString("id-ID")
            )}
          </p>
          <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardOverview() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["employees", "", 1, 1],
        queryFn: () => getEmployees({ page: 1, size: 1 }),
      },
      {
        queryKey: ["time-off-approvals", { status: "PENDING", page: 1, size: 5 }],
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
    ],
  });

  const [employees, approvals, visits, sanctions] = results;

  const totalEmployees = employees.data?.paging?.total_item;
  const totalPendingApprovals = approvals.data?.paging?.total_item;
  const totalVisits = visits.data?.paging?.total_item;
  const totalActiveSanctions = sanctions.data?.paging?.total_item;

  const recentApprovals = approvals.data?.data ?? [];
  const recentVisits = visits.data?.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          label="Total Karyawan"
          value={totalEmployees}
          href="/employees"
          color="bg-blue-50"
        />
        <StatCard
          icon={<CalendarClock className="w-5 h-5 text-amber-600" />}
          label="Cuti Menunggu Persetujuan"
          value={totalPendingApprovals}
          href="/time-off-approvals"
          color="bg-amber-50"
        />
        <StatCard
          icon={<MapPin className="w-5 h-5 text-emerald-600" />}
          label="Total Kunjungan"
          value={totalVisits}
          href="/visits"
          color="bg-emerald-50"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          label="Sanksi Aktif"
          value={totalActiveSanctions}
          href="/employee-sanctions"
          color="bg-red-50"
        />
      </div>

      {/* Two column section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Pending Approvals */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-800">
                Pengajuan Cuti Pending
              </h2>
            </div>
            <Link
              href="/time-off-approvals"
              className="text-xs text-blue-600 hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {approvals.isLoading ? (
            <div className="px-6 py-8 text-center text-sm text-zinc-400">
              Memuat data...
            </div>
          ) : recentApprovals.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-zinc-400">
              Tidak ada pengajuan pending
            </div>
          ) : (
            <ul className="divide-y divide-zinc-50">
              {recentApprovals.map((approval) => {
                const req = approval.time_off_request;
                const contract = req.employee.contracts?.[0];
                return (
                  <li key={approval.id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-zinc-100 text-zinc-700 font-semibold flex items-center justify-center text-sm shrink-0">
                        {req.employee.fullname.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">
                          {req.employee.fullname}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">
                          {contract
                            ? `${contract.position.name} · ${contract.division.name}`
                            : req.time_off_type.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <Badge variant="warning">PENDING</Badge>
                      <p className="text-xs text-zinc-400">
                        {req.requested_days} hari
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent Visits */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-50">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-800">
                Kunjungan Terbaru
              </h2>
            </div>
            <Link
              href="/visits"
              className="text-xs text-blue-600 hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {visits.isLoading ? (
            <div className="px-6 py-8 text-center text-sm text-zinc-400">
              Memuat data...
            </div>
          ) : recentVisits.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-zinc-400">
              Tidak ada kunjungan
            </div>
          ) : (
            <ul className="divide-y divide-zinc-50">
              {recentVisits.map((visit) => (
                <li key={visit.id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center justify-center text-sm shrink-0">
                      {visit.employee_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">
                        {visit.employee_name}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {visit.client_name}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 shrink-0">
                    {toIDDate(new Date(visit.created_at * 1000))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
