"use client";

import * as React from "react";

import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePendingAttendanceLogs } from "@/features/attendance/hooks/use-pending-attendance-logs";
import { useSearchTimeOffAppr } from "@/features/time-off-approval/hooks/use-search-timeoffappr";
import { useCurrentUser } from "@/features/user/hooks/use-current-user";
import {
  Alert02Icon,
  Building01Icon,
  CalendarCheckIn01Icon,
  CalendarLove01Icon,
  CheckmarkCircle01Icon,
  ClipboardCheck,
  Clock01Icon,
  CommandIcon,
  DashboardSquare01Icon,
  GridIcon,
  HelpCircleIcon,
  MapPin,
  MapsLocation01Icon,
  Megaphone01Icon,
  Search01Icon,
  Settings02Icon,
  Settings05Icon,
  SlidersHorizontalIcon,
  UserGroupIcon,
  UserLock01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type MenuItem = {
  label: string;
  icon: typeof DashboardSquare01Icon;
  path: string;
  permission?: string;
  totalData?: number;
};

type MenuCategory = {
  title: string;
  items: MenuItem[];
};

const createMenuCategories = (
  pendingApprovals: number,
  pendingAttendanceApprovals: number,
): MenuCategory[] => [
  {
    title: "Utama",
    items: [
      {
        label: "Dashboard",
        icon: DashboardSquare01Icon,
        path: "/dashboard",
      },
    ],
  },
  {
    title: "Karyawan",
    items: [
      {
        label: "Data Karyawan",
        icon: UserGroupIcon,
        path: "/employees",
        permission: "EMPLOYEES",
      },
      {
        label: "Izin & Cuti",
        icon: CalendarLove01Icon,
        path: "/time-offs",
        permission: "TIME_OFF_REQUESTS",
      },
      {
        label: "Persetujuan Izin & Cuti",
        icon: CheckmarkCircle01Icon,
        path: "/time-off-approvals",
        permission: "TIME_OFF_APPROVALS",
        totalData: pendingApprovals,
      },
      {
        label: "Kehadiran",
        icon: CalendarCheckIn01Icon,
        path: "/attendances",
        permission: "ATTENDANCES",
      },
      {
        label: "Persetujuan Kehadiran",
        icon: ClipboardCheck,
        path: "/attendance-approvals",
        permission: "ATTENDANCE_APPROVALS",
        totalData: pendingAttendanceApprovals,
      },
      {
        label: "Sanksi / Pelanggaran",
        icon: Alert02Icon,
        path: "/employee-sanctions",
        permission: "EMPLOYEE_SANCTIONS",
      },
    ],
  },
  {
    title: "Bisnis Bank",
    items: [
      {
        label: "Penagihan Kredit",
        icon: Wallet01Icon,
        path: "/credit-collections",
        permission: "REMIDIAL_VISITS",
      },
      {
        label: "Kunjungan Klient",
        icon: MapsLocation01Icon,
        path: "/visits",
        permission: "VISITS",
      },
    ],
  },
  {
    title: "Penggajian",
    items: [
      {
        label: "Komponen Gaji",
        icon: SlidersHorizontalIcon,
        path: "/salary-components",
        permission: "SALARY_COMPONENTS",
      },
      {
        label: "Grid Gaji",
        icon: GridIcon,
        path: "/salary-grid",
        permission: "PAYROLLS",
      },

      {
        label: "Proses Payroll",
        icon: Wallet01Icon,
        path: "/payrolls",
        permission: "PAYROLLS",
      },
    ],
  },
  {
    title: "Administrasi",
    items: [
      {
        label: "Perusahaan",
        icon: Building01Icon,
        path: "/companies",
        permission: "COMPANIES",
      },
      {
        label: "Lokasi Kehadiran",
        icon: MapPin,
        path: "/office-locations",
        permission: "OFFICE_LOCATIONS",
      },
      {
        label: "Shift",
        icon: Clock01Icon,
        path: "/shifts",
        permission: "SHIFTS",
      },
      {
        label: "User Management",
        icon: UserLock01Icon,
        path: "/users",
        permission: "USERS",
      },
      {
        label: "Pengaturan",
        icon: Settings02Icon,
        path: "/settings",
        permission: "SETTINGS",
      },
    ],
  },
  {
    title: "Informasi",
    items: [
      {
        label: "Pengumuman",
        icon: Megaphone01Icon,
        path: "/announcements",
        permission: "ANNOUNCEMENTS",
      },
    ],
  },
];

const navSecondary = [
  {
    title: "Settings",
    url: "#",
    icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
  },
  {
    title: "Get Help",
    url: "#",
    icon: <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />,
  },
  {
    title: "Search",
    url: "#",
    icon: <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser() ?? undefined;
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const { data: timeOffApproval } = useSearchTimeOffAppr({
    page: 1,
    size: 100,
    status: "PENDING",
  });
  const { data: pendingAttendance } = usePendingAttendanceLogs({
    page: 1,
    size: 100,
  });
  const userPermissions = useMemo(
    () =>
      new Set(user?.permissions?.map((permission) => permission.name) ?? []),
    [user],
  );
  const filteredCategories = useMemo(
    () =>
      createMenuCategories(
        timeOffApproval?.paging?.total_item ??
          timeOffApproval?.data?.length ??
          0,
        pendingAttendance?.paging?.total_item ??
          pendingAttendance?.data?.length ??
          0,
      )
        .map((category) => ({
          ...category,
          items: category.items.filter(
            (item) =>
              item.label.toLowerCase().includes(search.toLowerCase()) &&
              (!item.permission || userPermissions.has(item.permission)),
          ),
        }))
        .filter((category) => category.items.length > 0),
    [search, timeOffApproval, pendingAttendance, userPermissions],
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <HugeiconsIcon
                  icon={CommandIcon}
                  strokeWidth={2}
                  className="size-5!"
                  color="#9ae600"
                />
                <span className="text-base font-semibold">BW Akses+</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={2}
                className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <SidebarInput
                aria-label="Cari menu"
                placeholder="Cari menu..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-8"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        {filteredCategories.map((category) => (
          <SidebarGroup key={category.title}>
            <SidebarGroupLabel>{category.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {category.items.map((item) => {
                  const isActive =
                    pathname === item.path ||
                    pathname.startsWith(`${item.path}/`);

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={isActive}
                        className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:hover:bg-primary/90"
                      >
                        <Link href={item.path}>
                          <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.totalData !== undefined && item.totalData > 0 && (
                        <SidebarMenuBadge className="bg-destructive text-white">
                          {item.totalData}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
