import Title from "@/components/ui/title/title";
import ListCreditCollection from "@/features/credit-collection/components/list-credit-collection";
import MenuCreditCollection from "@/features/credit-collection/components/menu-credit-collection";
import { SearchCreditCollectionRequest } from "@/features/credit-collection/schemas/credit-collection-schema";
import { serverApi } from "@/lib/server-api";
import { getQueryclient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type React from "react";

type Props = {
  searchParams: Promise<{
    page?: string;
    size?: string;
    employee_id?: string;
    nasabah_name?: string;
    no_pjm?: string;
    start_date?: string;
    end_date?: string;
  }>;
};

export default async function CreditCollectionsPage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const search: SearchCreditCollectionRequest = {
    page: Number(params.page || 1),
    size: Number(params.size || 10),
    employee_id: params.employee_id || "",
    nasabah_name: params.nasabah_name || "",
    no_pjm: params.no_pjm || "",
    start_date: params.start_date || "",
    end_date: params.end_date || "",
  };

  const queryClient = getQueryclient();
  await queryClient.prefetchQuery({
    queryKey: ["credit-collections-admin", search],
    queryFn: () =>
      serverApi("collecting/admin", {
        employee_id: search.employee_id,
        nasabah_name: search.nasabah_name,
        no_pjm: search.no_pjm,
        start_date: search.start_date,
        end_date: search.end_date,
        page: search.page,
        size: search.size,
      }),
  });

  return (
    <>
      <Title title="Penagihan Kredit" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MenuCreditCollection search={search} />
        <ListCreditCollection search={search} />
      </HydrationBoundary>
    </>
  );
}