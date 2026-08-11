import Title from "@/components/ui/title/title";
import ListPayroll from "@/features/payroll/components/list-payroll";
import MenuPayroll from "@/features/payroll/components/menu-payroll";
import { SearchPayrollRequest } from "@/features/payroll/schemas/payroll-schema";
import { serverApi } from "@/lib/server-api";
import { getQueryclient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type React from "react";

type Props = {
  searchParams: Promise<{
    status?: string;
    period_year?: string;
    page?: string;
    size?: string;
  }>;
};

export default async function PayrollsPage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const status = params.status || "";
  const periodYear = params.period_year ? Number(params.period_year) : undefined;
  const page = params.page || 1;
  const size = params.size || 10;

  const search: SearchPayrollRequest = {
    status,
    period_year: periodYear,
    page: Number(page),
    size: Number(size),
  };

  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: [
      "payrolls",
      "list",
      search.status ?? "",
      search.period_year ?? 0,
      search.page,
      search.size,
    ],
    queryFn: () =>
      serverApi("payrolls", {
        status: search.status,
        period_year: search.period_year,
        page: search.page,
        size: search.size,
      }),
  });

  return (
    <>
      <Title title="Payroll" />
      <MenuPayroll />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ListPayroll search={search} />
      </HydrationBoundary>
    </>
  );
}
