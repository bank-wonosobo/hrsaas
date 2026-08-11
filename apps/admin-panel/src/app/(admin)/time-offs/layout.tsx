"use client";
import Tabs from "@/components/shared/tabs/tabs";
import { Tab } from "@/lib/type";

interface Props {
  children: React.ReactNode;
}

export default function TimeOffLayout({ children }: Props) {
  const tabs: Tab[] = [
    { label: "Pengajuan Cuti", path: "/time-offs" },

    { label: "Jenis Cuti", path: "/time-offs/types" },
  ];

  return (
    <div>
      <Tabs tabs={tabs} />
      {/* Conten */}
      {children}
    </div>
  );
}
