"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, ClipboardList } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

export default function TimeOffLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const tabs = [
    { label: "Pengajuan Cuti", path: "/time-offs", icon: ClipboardList },
    { label: "Jenis Cuti", path: "/time-offs/types", icon: CalendarDays },
  ];
  const activeTab =
    tabs.find((tab) => pathname === tab.path)?.path ??
    tabs.find((tab) => pathname.startsWith(`${tab.path}/`))?.path ??
    tabs[0].path;

  return (
    <Tabs
      orientation="vertical"
      value={activeTab}
      onValueChange={(path) => router.push(path)}
      className="w-full items-start gap-3 md:gap-5"
    >
      <TabsList
        variant="line"
        className="w-12 shrink-0 items-stretch justify-start gap-1 rounded-none border-r bg-transparent p-0 pr-2 md:w-52 md:pr-3"
      >
        {tabs.map(({ label, path, icon: Icon }) => (
          <TabsTrigger
            key={path}
            value={path}
            aria-label={label}
            title={label}
            className="h-auto min-h-11 justify-start rounded-xl px-2 py-2 md:px-3"
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden truncate md:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="min-w-0 flex-1">{children}</div>
    </Tabs>
  );
}
