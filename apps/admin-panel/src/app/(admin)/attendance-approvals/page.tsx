import Title from "@/components/ui/title/title";
import AttendanceApprovals from "@/features/attendance/components/attendance-approvals";
import type React from "react";

type Props = {
  searchParams: Promise<{
    page?: string;
    size?: string;
  }>;
};

export default async function AttendanceApprovalsPage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const size = Math.min(100, Math.max(1, Number(params.size) || 10));

  return (
    <>
      <Title title="Persetujuan Kehadiran" />
      <AttendanceApprovals page={page} size={size} />
    </>
  );
}
