"use client";

import { PwaInstallButton } from "@/components/pwa-register";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ModeToggle } from "./mode-togle";

const routeLabels: Record<string, string> = {
  announcements: "Pengumuman",
  attendances: "Kehadiran",
  "attendance-approvals": "Persetujuan Kehadiran",
  companies: "Perusahaan",
  contract: "Kontrak Kepegawaian",
  dashboard: "Dashboard",
  dashboards: "Dashboard",
  detail: "Profil",
  directory: "Direktori",
  divisions: "Divisi",
  docs: "Dokumen",
  education: "Pendidikan",
  employees: "Karyawan",
  "employee-sanctions": "Sanksi / Pelanggaran",
  "office-locations": "Lokasi Kehadiran",
  payroll: "Gaji & Kompensasi",
  payrolls: "Proses Payroll",
  permissions: "Hak Akses",
  positions: "Posisi",
  sanction: "Sanksi",
  "sanction-types": "Jenis Sanksi",
  "salary-components": "Komponen Gaji",
  settings: "Pengaturan",
  shifts: "Shift",
  timeoffs: "Pengajuan Cuti",
  "time-off-approvals": "Persetujuan Izin & Cuti",
  "time-off-balance": "Kuota Cuti",
  "time-offs": "Pengajuan Cuti",
  training: "Pelatihan",
  types: "Jenis Cuti",
  users: "User Management",
  visits: "Kunjungan",
};

function getRouteLabel(segment: string) {
  return (
    routeLabels[segment] ??
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];
  let href = "";

  for (const [index, segment] of segments.entries()) {
    href += `/${segment}`;
    const isEmployeeId =
      segments[index - 1] === "employees" && !routeLabels[segment];

    if (!isEmployeeId) {
      breadcrumbs.push({ label: getRouteLabel(segment), href });
    }
  }

  if (breadcrumbs.length === 0) {
    breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => {
              const isCurrent = index === breadcrumbs.length - 1;

              return (
                <Fragment key={breadcrumb.href}>
                  <BreadcrumbItem>
                    {isCurrent ? (
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isCurrent && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mr-4 flex items-center gap-2 lg:mr-10">
        <PwaInstallButton />
        <ModeToggle />
      </div>
    </header>
  );
}
