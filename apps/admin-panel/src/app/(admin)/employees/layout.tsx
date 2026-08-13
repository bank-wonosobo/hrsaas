"use client";
import Tabs from "@/components/shared/tabs/tabs";
import { Tab } from "@/lib/type";

interface Props {
  children: React.ReactNode;
}

const tabs: Tab[] = [
  { label: "Kelola Karyawan", path: "/employees" },
  { label: "Direktori", path: "/employees/directory" },
];

export default function CompanyLayout({ children }: Props) {
  return (
    <div>
      <Tabs tabs={tabs} />
      {/* Conten */}
      {children}
    </div>
  );
}
