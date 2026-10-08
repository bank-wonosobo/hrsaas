import ListSalaryComponent from "@/features/salary-component/components/list-salary-component";
import MenuSalaryComponent from "@/features/salary-component/components/menu-salary-component";
import { SearchSalaryComponentRequest } from "@/features/salary-component/schemas/salary-component-schema";
import { serverApi } from "@/lib/server-api";
import { getQueryclient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type React from "react";

type Props = {
  searchParams: Promise<{
    key?: string;
    page?: string;
    size?: string;
  }>;
};

export default async function SalaryComponentsPage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const key = params.key || "";
  const page = params.page || 1;
  const size = params.size || 10;

  const search: SearchSalaryComponentRequest = {
    key,
    page: Number(page),
    size: Number(size),
  };

  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: [
      "salary-components",
      search.key,
      "",
      false,
      search.page,
      search.size,
    ],
    queryFn: () =>
      serverApi("salary-components", {
        key: search.key,
        page: search.page,
        size: search.size,
      }),
  });

  return (
    <>
      <header className="mt-4 mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Komponen Gaji</h1>
        <p className="text-sm text-muted-foreground">
          Kelola komponen penghasilan dan potongan dalam perhitungan payroll.
        </p>
      </header>
      <MenuSalaryComponent />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ListSalaryComponent search={search} />
      </HydrationBoundary>
    </>
  );
}
