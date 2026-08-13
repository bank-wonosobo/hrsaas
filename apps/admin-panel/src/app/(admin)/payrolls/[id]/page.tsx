import PayrollDetailView from "@/features/payroll/components/payroll-detail-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PayrollDetailPage({ params }: Props) {
  const { id } = await params;

  return <PayrollDetailView id={id} />;
}
