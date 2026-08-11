"use client";
import Badge from "@/components/ui/badge/badge";
import { useSearchTimeOffAppr } from "@/features/time-off-approval/hooks/use-search-timeoffappr";
import { useCurrentUser } from "@/features/user/hooks/use-current-user";
import { useLogout } from "@/features/user/hooks/use-logout";
import clsx from "clsx";
import {
  Building,
  CalendarHeart,
  CheckCircle,
  Clock,
  DoorClosed,
  Home,
  LucideIcon,
  MapPinned,
  NotebookPen,
  Search,
  Settings2,
  SlidersHorizontal,
  TriangleAlert,
  UserLock,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type Menu = {
  label: string;
  icon: LucideIcon;
  path: string;
  totalData?: number;
  permission?: string;
};

type MenuCategory = {
  title: string;
  items: Menu[];
};

export default function Sidebar() {
  const { data: timeOffApproval } = useSearchTimeOffAppr({
    page: 1,
    size: 100,
    status: "PENDING",
  });

  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const currentUser = useCurrentUser();
  const userPermissions = useMemo(
    () => new Set(currentUser?.permissions?.map((p) => p.name) ?? []),
    [currentUser],
  );

  const pathname = usePathname();
  const [key, setKey] = useState("");

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/");

  const categories: MenuCategory[] = useMemo(
    () => [
      {
        title: "Utama",
        items: [
          { label: "Dashboard", icon: Home, path: "/dashboard" },
        ],
      },
      {
        title: "Karyawan",
        items: [
          { label: "Data Karyawan", icon: Users, path: "/employees", permission: "EMPLOYEES" },
          { label: "Izin & Cuti", icon: NotebookPen, path: "/time-offs", permission: "TIME_OFF_REQUESTS" },
          {
            label: "Persetujuan Izin & Cuti",
            icon: CheckCircle,
            path: "/time-off-approvals",
            totalData: timeOffApproval?.data?.length ?? 0,
            permission: "TIME_OFF_APPROVALS",
          },
          { label: "Kehadiran", icon: CalendarHeart, path: "/attendances", permission: "ATTENDANCES" },
          { label: "Kunjungan", icon: MapPinned, path: "/visits", permission: "VISITS" },
          { label: "Sanksi / Pelanggaran", icon: TriangleAlert, path: "/employee-sanctions", permission: "EMPLOYEE_SANCTIONS" },
        ],
      },
      {
        title: "Payroll",
        items: [
          { label: "Proses Payroll", icon: Wallet, path: "/payrolls", permission: "PAYROLLS" },
          { label: "Komponen Gaji", icon: SlidersHorizontal, path: "/salary-components", permission: "SALARY_COMPONENTS" },
        ],
      },
      {
        title: "Administrasi",
        items: [
          { label: "Perusahaan", icon: Building, path: "/companies", permission: "COMPANIES" },
          { label: "Lokasi Kehadiran", icon: Building, path: "/office-locations", permission: "OFFICE_LOCATIONS" },
          { label: "Shift", icon: Clock, path: "/shifts", permission: "SHIFTS" },
          { label: "User Management", icon: UserLock, path: "/users", permission: "USERS" },
          { label: "Pengaturan", icon: Settings2, path: "/settings", permission: "SETTINGS" },
        ],
      },
    ],
    [timeOffApproval],
  );

  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          if (!item.label.toLowerCase().includes(key.toLowerCase())) return false;
          if (!item.permission) return true;
          return userPermissions.has(item.permission);
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [key, categories, userPermissions]);

  return (
    <div className="py-6">
      {/* Search */}
      <div className="px-6 md:px-8 mb-6">
        <div className="flex items-center rounded-full border border-gray-300 px-4 py-4 focus-within:border-gray-400">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <input
            placeholder="Search menu ..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Menu dengan kategori */}
      <div className="max-h-125 overflow-y-auto px-6 md:px-5 space-y-5">
        {filteredCategories.map((cat) => (
          <div key={cat.title}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-2 mb-1">
              {cat.title}
            </p>
            <div className="space-y-0.5">
              {cat.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    href={item.path}
                    key={item.path}
                    className={clsx(
                      "flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200",
                      active ? "bg-zinc-100 font-medium" : "hover:bg-zinc-50",
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon
                        className="w-4.5 h-4.5 text-zinc-600 shrink-0"
                        strokeWidth={active ? 2.2 : 1.6}
                      />
                      <span className="text-sm text-zinc-800">{item.label}</span>
                    </div>

                    {item.totalData !== undefined && item.totalData > 0 && (
                      <Badge variant="danger" className="bg-destructive! text-white!">
                        {item.totalData}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t my-4 mx-6 md:mx-8" />

      {/* Logout */}
      <button
        onClick={() => logout()}
        disabled={isLoggingOut}
        className="flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer hover:bg-zinc-50 transition-all mx-6 md:mx-5 w-[calc(100%-3rem)] disabled:opacity-50"
      >
        <DoorClosed className="w-4.5 h-4.5 text-red-500" />
        <span className="text-sm text-red-500">
          {isLoggingOut ? "Keluar..." : "Logout"}
        </span>
      </button>
    </div>
  );
}
