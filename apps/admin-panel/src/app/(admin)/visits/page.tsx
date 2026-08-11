import Title from "@/components/ui/title/title";
import ListVisit from "@/features/visit/components/list-visit";
import MenuVisit from "@/features/visit/components/menu-visit";
import { SearchVisitRequest } from "@/features/visit/schemas/visit-schema";
import { serverApi } from "@/lib/server-api";
import { getQueryclient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type React from "react";

type Props = {
  searchParams: Promise<{
    page?: string;
    size?: string;
    employee_id?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
  }>;
};

export default async function VisitPage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const page = params.page || 1;
  const size = params.size || 10;
  const employee_id = params.employee_id || "";
  const start_date = params.start_date || "";
  const end_date = params.end_date || "";
  const sort_by = params.sort_by || "newest";

  const search: SearchVisitRequest = {
    page: Number(page),
    size: Number(size),
    employee_id,
    start_date,
    end_date,
    sort_by,
  };

  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: ["visits", search],
    queryFn: () =>
      serverApi("visits", {
        page: search.page,
        size: search.size,
        employee_id: search.employee_id,
        start_date: search.start_date,
        end_date: search.end_date,
        sort_by: search.sort_by,
      }),
  });

  return (
    <>
      <Title title="Kunjungan Karyawan" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MenuVisit search={search} />
        <ListVisit search={search} />
      </HydrationBoundary>
    </>
  );
}
