"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileEmployee from "@/features/employee/components/detail/profile-employee";
import type { Tab } from "@/lib/type";
import {
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  GraduationCap,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const tabIcons: Record<string, LucideIcon> = {
  detail: UserRound,
  contract: BriefcaseBusiness,
  payroll: Banknote,
  "time-off-balance": CalendarDays,
  docs: FileText,
  education: GraduationCap,
  training: BookOpen,
};

type Props = {
  id: string;
  tabs: Tab[];
  children: React.ReactNode;
};

export default function EmployeeDetailTabs({ id, tabs, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const generalPath = `/employees/${id}/detail`;
  const activeTab =
    tabs.find(
      (tab) => pathname === tab.path || pathname.startsWith(`${tab.path}/`),
    )?.path ?? tabs[0]?.path;

  return (
    <div className="w-full">
      <Tabs
        orientation="vertical"
        value={activeTab}
        onValueChange={(path) => router.push(path)}
        className="mb-3 w-full flex-row items-start gap-3 md:gap-5"
      >
        <TabsList
          variant="line"
          className="w-12 shrink-0 items-stretch justify-start gap-1 rounded-none border-r bg-transparent p-0 pr-2 md:w-56 md:pr-3"
        >
          {tabs.map((tab) => {
            const section = tab.path.split("/").at(-1) ?? "";
            const Icon = tabIcons[section];

            return (
              <TabsTrigger
                key={tab.path}
                value={tab.path}
                aria-label={tab.label}
                title={tab.label}
                className="h-auto min-h-11 justify-start rounded-xl px-2 py-2 md:px-3"
              >
                {Icon && (
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                )}
                <span className="hidden truncate md:inline">{tab.label}</span>
                {tab.totalData && tab.totalData > 0 ? (
                  <span className="ml-auto hidden rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground md:inline">
                    {tab.totalData}
                  </span>
                ) : null}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <div className="min-w-0 flex-1">
          {pathname === generalPath ? <ProfileEmployee id={id} /> : children}
        </div>
      </Tabs>
    </div>
  );
}
