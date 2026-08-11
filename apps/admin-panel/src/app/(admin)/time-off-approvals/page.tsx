import Title from "@/components/ui/title/title";
import MenuTimeOffApproval from "@/features/time-off-approval/components/menu-time-off-approval";
import ListTimeOffApproval from "@/features/time-off-approval/components/list-time-off";
import { SearchTimeOffApproval } from "@/features/time-off-approval/schemas/time-off-approval-schema";
import { serverApi } from "@/lib/server-api";
import { getQueryclient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type React from "react";

type Props = {
  searchParams: Promise<{
    page?: string;
    size?: string;
    employee_id?: string;
    status?: string;
    time_off_type_id?: string;
    request_status?: string;
    start_date?: string;
    end_date?: string;
  }>;
};

export default async function TimeOffApprovalPage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;

  const search: SearchTimeOffApproval = {
    page: Number(params.page || 1),
    size: Number(params.size || 10),
    employee_id: params.employee_id || undefined,
    status: (params.status as SearchTimeOffApproval["status"]) || undefined,
    time_off_type_id: params.time_off_type_id || undefined,
    request_status: params.request_status || undefined,
    start_date: params.start_date || undefined,
    end_date: params.end_date || undefined,
  };

  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: ["time-off-approvals", search],
    queryFn: () =>
      serverApi("time-off-approvals/_current", {
        page: search.page,
        size: search.size,
        employee_id: search.employee_id,
        status: search.status,
        time_off_type_id: search.time_off_type_id,
        request_status: search.request_status,
        start_date: search.start_date,
        end_date: search.end_date,
      }),
  });

  return (
    <>
      <Title title="Persetujuan cuti karyawan" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MenuTimeOffApproval search={search} />
        <ListTimeOffApproval search={search} />
      </HydrationBoundary>
    </>
  );
}
