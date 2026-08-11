"use client";
import Tabs from "@/components/shared/tabs/tabs";
import { Tab } from "@/lib/type";

interface Props {
  children: React.ReactNode;
}

export default function EmployeeSanctionLayout({ children }: Props) {
  const tabs: Tab[] = [
    { label: "Sanksi Karyawan", path: "/employee-sanctions" },
    { label: "Jenis Sanksi", path: "/employee-sanctions/sanction-types" },
  ];

  return (
    <div>
      <Tabs tabs={tabs} />
      {children}
    </div>
  );
}
