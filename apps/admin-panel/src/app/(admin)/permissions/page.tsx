import Title from "@/components/ui/title/title";
import PivotTable from "@/features/permission/components/pivot-table";
import type React from "react";

export default function PermissionsPage(): React.ReactNode {
  return (
    <>
      <Title title="Roles & Permissions" />
      <PivotTable />
    </>
  );
}
