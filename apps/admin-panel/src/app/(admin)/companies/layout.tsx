"use client";
import Tabs from "@/components/shared/tabs/tabs";

type Tab = {
  label: string;
  path: string;
  totalData?: number;
};

interface Props {
  children: React.ReactNode;
}

const tabs: Tab[] = [
  { label: "Profile perusahaan", path: "/companies" },
  { label: "Posisi", path: "/companies/positions" },
  { label: "Divisi", path: "/companies/divisions" },
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
