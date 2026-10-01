import { Card, CardContent } from "@/components/ui/card";
import EmployeeDetailTabs from "@/features/employee/components/detail/employee-detail-tabs";
import EmployeeSummaryCard from "@/features/employee/components/detail/employee-summary-card";
import Title from "@/components/ui/title/title";
import { Tab } from "@/lib/type";

type Props = {
  params: Promise<{
    id: string;
  }>;
  children: React.ReactNode;
};

export default async function LayoutDetailEmployee({
  params,
  children,
}: Props) {
  const { id } = await params;
  const tabs: Tab[] = [
    { label: "General", path: `/employees/${id}/detail` },
    { label: "Kontrak Kepegawaian", path: `/employees/${id}/contract` },
    { label: "Gaji & Kompensasi", path: `/employees/${id}/payroll` },
    { label: "Kuota Cuti", path: `/employees/${id}/time-off-balance` },
    { label: "Dokumen", path: `/employees/${id}/docs` },
    { label: "Pendidikan", path: `/employees/${id}/education` },
    { label: "Pelatihan", path: `/employees/${id}/training` },

    // { label: "Kehadiran", path: `/employees/${id}/attendance` },
    // { label: "Sanksi", path: `/employees/${id}/sanction` },
  ];

  return (
    <>
      <Title title="Detail karyawan" previus="/employees" />
      <div className="sticky top-3 z-20 mb-5">
        <EmployeeSummaryCard id={id} />
      </div>
      <Card className="mt-5">
        <CardContent>
          <EmployeeDetailTabs id={id} tabs={tabs}>
            {children}
          </EmployeeDetailTabs>
        </CardContent>
      </Card>
    </>
  );
}
